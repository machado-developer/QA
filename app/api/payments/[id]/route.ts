import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import logAction from "@/services/auditService";
import { z } from "zod";

type Params = {
    params: {
        id: string;
    };
};

const paymentSchema = z.object({
    bookingId: z.string().uuid(),
    amount: z.number(),
    methodId: z.string().uuid(),
    description: z.string().min(1),
    telefone: z.string().min(9),
    cliente: z.string().min(1),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const id = (await params).id
        const payment = await prisma.payment.findUnique({
            where: {
                id
            },
            include: {
                method: true,
                booking: true,
            },
        });

        if (!payment) {
            return NextResponse.json({ message: "Pagamento não encontrado" }, { status: 404 });
        }

        return NextResponse.json(payment);
    } catch (error) {
        console.error("Erro ao buscar pagamento:", {
            message: (error as any).message,
            stack: (error as any).stack,
        });

        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}


export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const id = (await params).id

        const body = await req.json();
        const { ...data } = paymentSchema.extend({ id: z.string().uuid() }).parse(body);

        const existingPayment = await prisma.payment.findUnique({
            where: { id },
        });

        if (!existingPayment) {
            return NextResponse.json({ message: "Pagamento não encontrado" }, { status: 404 });
        }

        if (existingPayment.status === "CONCLUIDO") {
            return NextResponse.json({ message: "Não é permitido alterar um pagamento com status CONCLUIDO" }, { status: 403 });
        }


        const updatedPayment = await prisma.payment.update({
            where: { id },
            data: {
                bookingId: data.bookingId,
                methodId: data.methodId,
                description: data.description,
                telefone: data.telefone,
                cliente: data.cliente,
                amount: data.amount,
                // status pode ser alterado no seu form, mas você pode adicionar aqui também se quiser permitir edição de status
                status: body.status || existingPayment.status,
            },
            include: {
                method: true,
                booking: true,
            },
        });

        // Registrar no audit log
        await logAction(
            session.user.id,
            "Pagamento editado",
            `paymentId: ${id}`
        );
        //actualizar o estado da reserva
        if (body.status === "CONCLUIDO") {
            await prisma.booking.update({
                where: { id: data.bookingId },
                data: {
                    status: "CONFIRMADO"
                }
            })
        }

        if (body.status === "CANCELADO") {
            await prisma.booking.update({ where: { id: data.bookingId } , data:{
                status: "CANCELADO"
            }})
        }
        return NextResponse.json(updatedPayment, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: "Invalid input data" }, { status: 400 });
        }

        console.error("Erro ao atualizar pagamento:", {
            message: (error as any).message,
            stack: (error as any).stack,
        });

        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
