import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user.role !== "ADMINISTRADOR" && session.user.role !== "OPERADOR")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Pagamentos concluídos com detalhes
        const payments = await prisma.payment.findMany({
            where: {
                status: "CONCLUIDO"
            },
            include: {
                booking: {
                    include: {
                        user: true,
                        court: true
                    }
                },
                method: true
            }
        });

        // Total arrecadado
        const totalArrecadado = payments.reduce((acc, payment) => {
            const valor = payment.booking?.court?.pricePerHour ?? 0;
            return acc + valor;
        }, 0);

        // Agrupamento por método de pagamento
        const valoresPorMetodo: Record<string, number> = {};
        payments.forEach((p) => {
            const metodo = p.method?.name ?? "Desconhecido";
            const valor = p.booking?.court?.pricePerHour ?? 0;
            valoresPorMetodo[metodo] = (valoresPorMetodo[metodo] || 0) + valor;
        });

        // Detalhamento de pagamentos por mês
        const pagamentosPorMes: Record<string, number> = {};
        payments.forEach((p) => {
            const mes = new Date(p.createdAt).toLocaleString("default", { month: "long", year: "numeric" });
            const valor = p.booking?.court?.pricePerHour ?? 0;
            pagamentosPorMes[mes] = (pagamentosPorMes[mes] || 0) + valor;
        });

        return NextResponse.json({
            totalArrecadado,
            quantidadePagamentos: payments.length,
            valoresPorMetodo,
            pagamentosPorMes,
            pagamentosDetalhados: payments.map((p) => ({
                id: p.id,
                court: p.booking?.court?.name ?? "Indefinida",
                usuario: p.booking?.user?.name ?? "Desconhecido",
                valor: p.booking?.court?.pricePerHour ?? 0,
                metodo: p.method?.name ?? "Desconhecido",
                data: p.createdAt
            }))
        });
    } catch (error) {
        console.error("Erro ao gerar relatório financeiro:", error);
        return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 });
    }
}
