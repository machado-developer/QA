import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import logAction from "@/services/auditService";
import { authOptions } from "@/lib/auth";
import { create } from "domain";

const prisma = new PrismaClient();

const courtSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),

  description: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  mainImage: z.string(),
  pricePerHour: z.number().min(0),

  availables: z.array(z.object({
    date: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    period: z.enum(["MANHA", "TARDE",]),
  })).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const courts = await prisma.court.findMany({

      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ courts });
  } catch (error) {
    console.error("Error details:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = courtSchema.parse(body);
    const userId = session.user.id;

    const court = await prisma.court.create({
      data: {
        name: data.name,
        description: data.description,
        pricePerHour: data.pricePerHour,
        address: data.address,
        city: data.city,
        courtImages: {
          create: data.images?.map((url) => ({ url, createdById: userId })) || [],
        },
        featuredImage: data.mainImage,
      }
    });
    const availability = await prisma.availability.createMany({
      data: data.availables?.map((item) => ({
        date: item.date,
        courtId: court.id,
        startTime: item.startTime,
        endTime: item.endTime,
        period: item.period,
        createdById: session.user.id,
        updatedById: session.user.id,
      })) || [],
    });


    await logAction(userId, "Nova quadra Criada", `Nome: ${court.name}`);
    return NextResponse.json(court, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input data" }, { status: 400 });
    }
    console.error("Error details:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
