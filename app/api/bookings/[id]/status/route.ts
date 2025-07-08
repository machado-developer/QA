import { bookingSchema } from "@/app/perfil/reservas/schema/bookSchema";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import logAction from "@/services/auditService";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

        // 🔒 Regra de cancelamento
        if (data.status === "CANCELADO") {
            // ❌ Não pode cancelar se pagamento estiver CONCLUIDO
            if (existingBooking.payment?.status === "CONCLUIDO") {
                return NextResponse.json({ message: "Não é possível cancelar uma reserva com pagamento CONCLUÍDO." }, { status: 400 });
            }

            // ❌ Não pode cancelar se faltar menos de 1 hora para o início
            const agora = new Date();
            const inicio = new Date(existingBooking.availability.startTime);
            const diffEmMinutos = (inicio.getTime() - agora.getTime()) / 60000;

            if (diffEmMinutos < 60) {
                return NextResponse.json({ message: "Só é possível cancelar com no mínimo 1 hora de antecedência." }, { status: 400 });
            }
        }

        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: {
                status: data.status,
            },
        });

        // 🟢 Atualiza disponibilidade se necessário
        if (existingBooking.availability) {
            await prisma.availability.update({
                where: { id: existingBooking.availability.id },
                data: {
                    active: ["CANCELADO", "CONCLUIDO"].includes(data.status ?? "") ? true : false,
                },
            });
        }

        await logAction(userId, "UPDATE_STATUS", `O status da reserva ${data.id} foi alterado para ${data.status}`);

        return NextResponse.json(updatedBooking, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: "Dados inválidos" }, { status: 400 });
        }

        console.error("Erro ao atualizar parcialmente booking:", error);
        return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
    }
}
