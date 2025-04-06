import { authOptions } from "@/lib/auth";
import logAction from "@/services/auditService";
import { PrismaClient, TransactionType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server"


export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id; // Await the params promise to get the id
        const prisma = new PrismaClient()
        const session = await getServerSession(authOptions)
        const { amount } = await req.json();


        const goal = await prisma.goal.findUnique({
            where: { id },
            select: {
                savedAmount: true,
                targetAmount: true,
            },
        });

        if (!goal) {
            return NextResponse.json({ error: "Meta não encontrada" }, { status: 404 });
        }
        const savedAmount = Number(goal.savedAmount);
        const targetAmount = Number(goal.targetAmount);

        if (savedAmount >= targetAmount) {
            return NextResponse.json({ error: "Esta meta já se encontra concluída" }, { status: 400 });
        }
        const updatedGoal = await prisma.goal.update({
            where: { id },
            data: { savedAmount: { increment: amount } },
        });
        //buscarndo os dados da meta financeira
        const goalActual = await prisma.goal.findUnique({
            where: { id },
            include: {
                category: true
            }
        });

        //registrando a nova transacao com os dados da meta actual
        const userId = session?.user?.id.toString()||`null`;
        const transaction = await prisma.transaction.create({
            data: {
                description: `Valor movimentado referente a meta financeira ${goalActual?.name}`,
                categoryId: goalActual?.categoryId ?? "",
                amount,
                type: goalActual?.category?.type as TransactionType, // Ensure type is TransactionType
                userId,
                date: new Date(),
            },
        })
        await logAction(userId, "Nova Transação", `Descrição: ${transaction.description}, Tipo: ${transaction.type}, Quantia: ${transaction.amount}`);

        return NextResponse.json({ goal: updatedGoal }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to add transaction" }, { status: 500 });
    }
}
