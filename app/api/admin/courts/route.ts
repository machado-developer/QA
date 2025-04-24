import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { datetimeRegex, z } from "zod"
import logAction from "@/services/auditService"
import { prisma } from "@/lib/prisma"
import { $Enums } from "@prisma/client";
import { toZonedTime, format } from "date-fns-tz";
import { differenceInMinutes } from "date-fns"
import { parseAvailabilityToUTC } from "@/lib/dateTime.utils"


const TIMEZONE = "Africa/Luanda";

const availabilitySchema = z.object({
  startTime: z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid startTime"),
  endTime: z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid endTime"),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
}).superRefine((data, ctx) => {
  const { startTime, endTime, date } = data;

  const startDateTime = toZonedTime(`${date}T${startTime}:00`, TIMEZONE);
  let endDateTime = toZonedTime(`${date}T${endTime}:00`, TIMEZONE);

  // Se o horário de término for anterior ao de início, assume que vai para o dia seguinte
  if (endDateTime <= startDateTime) {
    endDateTime = new Date(endDateTime.getTime() + 24 * 60 * 60 * 1000); // adiciona 1 dia
  }

  const duration = differenceInMinutes(endDateTime, startDateTime);
  if (duration <= 0) {
    ctx.addIssue({
      path: ["endTime"],
      message: "End time must be after start time.",
      code: z.ZodIssueCode.custom,
    });
  }
});

const courtSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  categoryId: z.string(),
  description: z.string().optional(),
  pricePerHour: z.number().positive(),
  featuredImage: z.string().url(),
  availabilities: z.array(availabilitySchema).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // if (!session?.user || !session?.user?.id) {
    //   return NextResponse.json(
    //     { message: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }


    const courts = await prisma.court.findMany({
      
      include: {
        courtImages: true,
        availabilities: true,
        bookings: true,
        category: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ courts });
  } catch (error) {
    console.error("Error details:", {
      message: (error as any).message,
      stack: (error as any).stack,
      name: (error as any).name,
      ...(error as any),
    });

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()

    const data = courtSchema.parse(body)
    const userId = session.user.id

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 });
    }

    // const existingCourts = await prisma.court.findUnique({
    //   where: { name: data.name, address: data.address, city: data.city },
    // });

    // if (!existingCourts) {
    //   return NextResponse.json({ message: "Quadra já existe" }, { status: 409 });
    // }

    type Period = $Enums.Period;

    const getPeriod = (startTime: string, endTime: string): Period => {
      const startHour = parseInt(startTime.split(":")[0], 10);
      const endHour = parseInt(endTime.split(":")[0], 10);

      if (startHour >= 6 && endHour <= 12) {
        return "MANHA"; // Morning
      } else if (startHour >= 12 && endHour <= 18) {
        return "TARDE"; // Afternoon
      } else {
        return "NOITE"; // Evening
      }
    };

    // const startTime = data.availabilities?.map((a) => ({
    //   startTime: new Date(a.startTime),
    //   endTime: a.endTime,
    //   period: getPeriod(a.startTime, a.endTime),
    // })) || [];



    const period = data.availabilities?.map((a) => ({
      startTime: new Date(a.startTime),
      endTime: a.endTime,
      period: getPeriod(a.startTime, a.endTime),
    })) || [];

    const court = await prisma.court.create({
      data: {
        name: data.name,
        address: data.address,
        city: data.city,
        description: data.description,
        pricePerHour: data.pricePerHour,
        category: {
          connect: {
            id: data.categoryId
          }
        },
        featuredImage: data.featuredImage,
        createdBy: {
          connect: {
            id: userId,
          },
        },

      }
    })

    await prisma.availability.createMany({
      data: data.availabilities?.map((a) => {
        const { startDateUTC, endDateUTC } = parseAvailabilityToUTC({
          date: a.date,
          startTime: a.startTime,
          endTime: a.endTime,
        });

        return {
          date: new Date(a.date),
          startTime: startDateUTC,
          endTime: endDateUTC,
          period: getPeriod(a.startTime, a.endTime) as Period,
          createdById: userId,
          courtId: court.id,
        };
      }) || [],
    });

    await prisma.courtImage.createMany({
      data: data.featuredImage ? [{
        courtId: court.id,
        url: String(data.featuredImage),
      }] : [],
    });

    await logAction(userId, "Nova Quadra Criada", `Nome: ${court.name}, Cidade: ${court.city}`)

    return NextResponse.json(court, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log("Error details:", {
        message: (error as any).message,
        stack: (error as any).stack,
        name: (error as any).name,
        ...(error as any),
      })
      return NextResponse.json(
        { message: "Invalid input data", errors: error.errors },
        { status: 400 }
      )
    }

    console.log("Error details:", {
      message: (error as any).message,
      stack: (error as any).stack,
      name: (error as any).name,
      ...(error as any),
    })

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

