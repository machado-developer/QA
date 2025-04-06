import { PrismaClient, TransactionType } from "@prisma/client"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const [transactions, goals, categories] = await Promise.all([
      prisma.transaction.findMany({
      where: {
        userId: session?.user?.id,
      },
      include: {
        category: true,
      },
      take: 5,
      }),
      prisma.goal.findMany({
      where: {
        userId: session?.user?.id,
        deadline: {
        gte: new Date(),
        },
        savedAmount: {
        lt: prisma.goal.fields.targetAmount, // Apenas metas ainda não atingidas
        },
      },
      orderBy: {
        deadline: "asc",
      },
      take: 5,
      }),
      prisma.category.findMany({
      where: {
        transactions: {
        some: {
          userId: session?.user?.id,
        },
        },
      },
      include: {
        transactions: {
        where: {
          userId: session?.user?.id,
          type: "DESPESA",
        },
        take: 5,
        },
      },
      take: 5,
      }),
    ])

    const totalIncome = transactions
      .filter((t) => t.type === "RECEITA")
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactions
      .filter((t) => t.type === TransactionType.DESPESA)
      .reduce((sum, t) => sum + t.amount, 0)

    const categoryBreakdown = categories
      .map((category) => ({
        name: category.name,
        value: category.transactions.reduce((sum, t) => sum + t.amount, 0),
      }))
      .filter((c) => c.value > 0)

    return NextResponse.json({
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      recentGoals: goals,
      categoryBreakdown,
    })
  } catch (error) {
    console.log("ERRO", JSON.stringify(error));

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}