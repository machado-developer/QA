
import { bookingSchema } from "@/app/perfil/reservas/schema/bookSchema";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma"; // Faltou aqui
import logAction from "@/services/auditService";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const id = (await params).id;
        const body = await req.json();
        const data = bookingSchema.partial().parse(body);
        const userId = session.user.id;

        const existingBooking = await prisma.booking.findUnique({
            where: { id },
            include: {
                payment: true,
                availability: true,
            },
        });

        if (!existingBooking) {
            return NextResponse.json({ message: "Agendamento não encontrado." }, { status: 404 });
        }

        // 🔒 Regras de cancelamento
        if (data.status === "CANCELADO") {
            // ❌ Se pagamento estiver CONCLUIDO, não pode cancelar
            if (existingBooking.payment?.status === "CONCLUIDO") {
                return NextResponse.json(
                    { message: "Não é possível cancelar uma reserva com pagamento CONCLUÍDO." },
                    { status: 400 }
                );
            }

            // ❌ Se faltar menos de 1 hora para o início
            const agora = new Date();
            const inicio = new Date(existingBooking.availability.startTime);
            const minutosRestantes = (inicio.getTime() - agora.getTime()) / 60000;

            if (minutosRestantes < 60) {
                return NextResponse.json(
                    { message: "Só é possível cancelar com pelo menos 1 hora de antecedência." },
                    { status: 400 }
                );
            }
        }

        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: {
                status: data.status || existingBooking.status,
            },
        });

        await logAction(userId, "Atualização de Agendamento", `ID: ${updatedBooking.id}, Status: ${updatedBooking.status}`);

        return NextResponse.json(updatedBooking, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: "Dados inválidos" }, { status: 400 });
        }

        console.error("Erro ao atualizar booking:", error);
        return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
    }
}


export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const id = (await params).id;
        const userId = session.user.id;

        const existingBooking = await prisma.booking.findUnique({
            where: { id },
        });

        if (!existingBooking) {
            return NextResponse.json({ message: "Agendamento não encontrado." }, { status: 404 });
        }

        // 🔒 Só permite apagar se status for CANCELADO ou CONCLUIDO
        if (!["CANCELADO", "CONCLUIDO"].includes(existingBooking.status)) {
            return NextResponse.json({
                message: `Agendamento só pode ser excluído se estiver CANCELADO ou CONCLUÍDO. Status atual: ${existingBooking.status}`
            }, { status: 403 });
        }

        await prisma.booking.delete({
            where: { id },
        });

        await logAction(userId, "Exclusão de Agendamento", `ID: ${id}`);

        return NextResponse.json({ message: "Agendamento excluído com sucesso." }, { status: 200 });
    } catch (error) {
        console.error("Erro ao excluir booking:", error);
        return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
    }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const id = (await params).id;

        const booking = await prisma.booking.findUnique({
            where: { id },
            include: {
                user: true,
                court: true,
                availability: true,
            }
        });

        if (!booking) {
            return NextResponse.json({ message: "Agendamento não encontrado." }, { status: 404 });
        }

        return NextResponse.json(booking, { status: 200 });
    } catch (error) {
        console.error("Erro ao buscar booking:", error);
        return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
    }
}

