import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";
import { generatePaymentCode } from "@/lib/utils";
import logAction from "@/services/auditService";
import { z } from "zod";

// Validação do corpo da requisição
const paymentSchema = z.object({
  bookingId: z.string().uuid(),
  amount: z.number(),
  methodId: z.string().uuid(),
  description: z.string().min(1),
  telefone: z.string().min(9),
  cliente: z.string().min(1),
});



export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const methodId = searchParams.get("methodId") || undefined;
    const bookingId = searchParams.get("bookingId") || undefined;
    const search = searchParams.get("search") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;


    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const where: {
      status?: PaymentStatus;
      methodId?: string;
      bookingId?: string;
      description?: { contains: string; mode: "insensitive" };
      createdAt?: { gte?: Date; lte?: Date };
    } = {
      ...(status ? { status: status as PaymentStatus } : {}),
      ...(methodId ? { methodId } : {}),
      ...(bookingId ? { bookingId } : {}),
      ...(search ? { description: { contains: search, mode: "insensitive" } } : {}),
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          method: true,
          booking: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    return NextResponse.json({
      payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar pagamentos:", {
      message: (error as any).message,
      stack: (error as any).stack,
    });

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
    const data = paymentSchema.parse(body);

    const payment = await prisma.payment.create({
      data: {
        bookingId: data.bookingId,
        methodId: data.methodId,
        description: data.description,
        cliente: data.cliente,
        telefone: data.telefone,
        amount:data.amount,
        creatorName: session.user.name,
        creatorEmail: session.user.email,
        codigo: generatePaymentCode()
        // status é opcional porque o modelo já define um valor padrão (PENDENTE)
      },
      include: {
        method: true,
        booking: true,
      },
    });

    // Registrar no audit log
    await logAction(
      session.user.id,
      "Pagamento registrado",
      `bookingId: ${data.bookingId}, methodId: ${data.methodId}`
    );

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input data" }, { status: 400 });
    }

    console.error("Erro ao registrar pagamento:", {
      message: (error as any).message,
      stack: (error as any).stack,
    });

    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
