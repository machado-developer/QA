import { PrismaClient, TransactionType } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
"@/lib/auth";


const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMINISTRADOR") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const [transactions, goals, categories, totalUsers, totalTransactions] = await Promise.all([
      prisma.transaction.findMany({
        include: { category: true },
      }),
      prisma.goal.findMany({
        where: {
          deadline: {
            gte: new Date(),
          },
          savedAmount: {
            lt: prisma.goal.fields.targetAmount,
          },
        },
        orderBy: {
          deadline: "asc",
        },
      }),
      prisma.category.findMany({
        include: {
          transactions: {
            where: {
              type: "DESPESA",
            },
          },
        },
      }),
      prisma.user.count(),
      prisma.transaction.count(),
    ]);

    const totalIncome = transactions
      .filter((t) => t.type === "RECEITA")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === TransactionType.DESPESA)
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryBreakdown = categories
      .map((category) => ({
        name: category.name,
        value: category.transactions.reduce((sum, t) => sum + t.amount, 0),
      }))
      .filter((c) => c.value > 0);

    const chartData = {
      incomeVsExpenses: [
        { label: "Receitas", value: totalIncome },
        { label: "Despesas", value: totalExpenses }
      ],
      categoryDistribution: categoryBreakdown,
    };

    return NextResponse.json({
      totalUsers,
      totalTransactions,
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      activeGoals: goals.length,
      categoryBreakdown,
      chartData,
    });
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
