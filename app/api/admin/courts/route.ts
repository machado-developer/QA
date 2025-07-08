import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import logAction from "@/services/auditService"
import { prisma } from "@/lib/prisma"
import { $Enums } from "@prisma/client";
import { toZonedTime, format } from "date-fns-tz";
import { differenceInMinutes } from "date-fns"
import { parseAvailabilityToUTC } from "@/lib/dateTime.utils"
import { parseISO, isBefore, isAfter, startOfDay, addHours, parse, isValid } from "date-fns";

const TIMEZONE = "Africa/Luanda";
const availabilitySchema = z.object({
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida, use o formato YYYY-MM-DD")
    .refine((dateStr) => {
      const date = parseISO(dateStr);
      return isValid(date);
    }, "Data inválida"),
  active: z.boolean().optional().default(true),
  startTime: z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Horário de início inválido"),
  endTime: z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Horário de término inválido"),
}).superRefine((data, ctx) => {
  const { date, startTime, endTime } = data;

  const now = new Date();
  const minStartTime = addHours(now, 1); // mínimo 1 hora da hora atual

  const dateObj = parseISO(date);
  if (!isValid(dateObj)) {
    ctx.addIssue({
      path: ["date"],
      message: "Data inválida.",
      code: z.ZodIssueCode.custom,
    });
    return; // para evitar erros em validações subsequentes
  }

  // Verifica se a data é no passado (sem considerar hora)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (dateObj < startOfToday) {
    ctx.addIssue({
      path: ["date"],
      message: "A data não pode ser no passado.",
      code: z.ZodIssueCode.custom,
    });
  }

  // Parse horário início e término para Date
  const startDateTime = parse(`${date} ${startTime}`, "yyyy-MM-dd HH:mm", new Date());
  const endDateTime = parse(`${date} ${endTime}`, "yyyy-MM-dd HH:mm", new Date());

  if (!isValid(startDateTime)) {
    ctx.addIssue({
      path: ["startTime"],
      message: "Horário de início inválido.",
      code: z.ZodIssueCode.custom,
    });
  }
  if (!isValid(endDateTime)) {
    ctx.addIssue({
      path: ["endTime"],
      message: "Horário de término inválido.",
      code: z.ZodIssueCode.custom,
    });
  }

  if (isValid(startDateTime) && isValid(endDateTime)) {
    if (!(endDateTime > startDateTime)) {
      ctx.addIssue({
        path: ["endTime"],
        message: "O horário de término deve ser depois do horário de início (mesmo dia).",
        code: z.ZodIssueCode.custom,
      });
    }

    // Validação que o horário de início deve ter 1 hora de diferença da hora atual
    if (startDateTime < minStartTime) {
      ctx.addIssue({
        path: ["startTime"],
        message: "O horário de início deve ser pelo menos 1 hora após o horário atual.",
        code: z.ZodIssueCode.custom,
      });
    }
  }
});

const courtSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  categoryId: z.string(),
  description: z.string().optional(),
  pricePerHour: z.number().positive(),
  courtImages: z.array(z.string().url()).optional(),
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
    let where: Record<string, any> = {};
    if (session?.user && session.user.role.toLocaleLowerCase() !== "cliente") {

      where.createdById = session.user.id
    }

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
          active: true,
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

    // Criação das imagens extras
    if (data.courtImages && data.courtImages.length > 0) {
      await prisma.courtImage.createMany({
        data: data.courtImages.map((url) => ({
          courtId: court.id,
          url,
        })),
      });
    }


    await logAction(userId, "Nova Quadra Criada", `Nome: ${court.name}, Cidade: ${court.city}`)

    return NextResponse.json(court, { status: 201 })
  } catch (error) {
    // if (error instanceof z.ZodError) {
    //   console.log("Error details:", {
    //     message: (error as any).message,
    //     stack: (error as any).stack,
    //     name: (error as any).name,
    //     ...(error as any),
    //   })
    //   return NextResponse.json(
    //     { message: "Invalid input data", errors: error.errors },
    //     { status: 400 }
    //   )
    // }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Dados inválidos",
          issues: error.issues,  // issues é um array com { path, message, code }
        },
        { status: 400 }
      );
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

