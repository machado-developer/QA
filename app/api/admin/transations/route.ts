import { PrismaClient, TransactionType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import logAction from "@/services/auditService";
import { authOptions } from "@/lib/auth";
"@/lib/auth";

const prisma = new PrismaClient();

const transactionSchema = z.object({
  amount: z.number().positive(),
  type: z.nativeEnum(TransactionType),
  description: z.string().min(1),
  categoryId: z.string(),
  userId: z.string().optional(),
  date: z.string().optional(),
});

// Adjust the GET function to accept RouteContext
export async function GET(req: NextRequest, { params }: { params: Promise<{ type?: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url); // Captura os query params da URL
    const type = searchParams.get("type")?.toLocaleUpperCase(); // Obtém o parâmetro 'type'

    if (type && type !== 'RECEITA' && type !== 'DESPESA') {
      return NextResponse.json({ status: 400, error: 'Tipo inválido' });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        type: type as TransactionType
      },
      include: {
        category: true,
        user: true
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json({ transactions });

  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Adjust the POST function to accept RouteContext
export async function POST(req: NextRequest, { params }: { params: Promise<{ type?: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const data = transactionSchema.parse(body);
    const userId = session?.user?.id;
    const transaction = await prisma.transaction.create({
      data: {
        ...data,
        userId: session?.user?.id,
        date: new Date(),
      },
    });
    await logAction(userId, "Nova Transação", `Descrição: ${transaction.description}, Tipo: ${transaction.type}, Quantia: ${transaction.amount}`);

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input data" },
        { status: 400 }
      );
    }
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