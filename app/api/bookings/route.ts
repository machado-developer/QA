import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import logAction from "@/services/auditService";
import { BookingStatus } from "@prisma/client";

const bookingSchema = z.object({
  id: z.string().optional(),
  courtId: z.string(),
  availabilityId: z.string().min(1),
  status: z.enum(["PENDENTE", "CONFIRMADO", "CANCELADO"]).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const userId = searchParams.get("clientId") || undefined;
    const search = searchParams.get("search") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;


    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const where: {
      status?: BookingStatus;
      userId?: string;
      description?: { contains: string; mode: "insensitive" };
      createdAt?: { gte?: Date; lte?: Date };
      date?: { gte?: Date; lte?: Date };
      endTime?: {}
      startTime?: {}
    } = {
      ...(status ? { status: status as BookingStatus } : {}),
      ...(userId ? { userId } : {}),
      ...(search ? { description: { contains: search, mode: "insensitive" } } : {}),
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }


    const [bookings,total] = await Promise.all([ 
     prisma.booking.findMany({
      where,
      include: {
        user: true,
        court: true,
        availability: true,
        payment: true,
      },
      orderBy: {
        createdAt: "desc",
      }, skip,
      take: limit,
    }), 
    prisma.booking.count({ where }),
  
  ]
  
  )

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("BODY", body);
    const data = bookingSchema.parse(body);
    const userId = session.user.id;

    // Verificar se já existe agendamento para essa disponibilidade
    const existingBooking = await prisma.booking.findUnique({
      where: {
        availabilityId: data.availabilityId,
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { message: "Horário já está agendado por outro usuário." },
        { status: 409 } // Conflito
      );
    }

    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        courtId: data.courtId,
        availabilityId: data.availabilityId,
        status: data.status || "PENDENTE",
        createdById: userId,
      },
    });

    await logAction(userId, "Novo Agendamento", `ID: ${booking.id}, Quadra: ${booking.courtId}`);

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Dados inválidos" }, { status: 400 });
    }

    // Capturar erro de violação de chave única no Prisma
    if ((error as any).code === "P2002") {
      return NextResponse.json(
        { message: "Este horário já foi agendado por outra pessoa." },
        { status: 409 }
      );
    }

    console.error("Erro ao criar booking:", error);
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
  }
}
