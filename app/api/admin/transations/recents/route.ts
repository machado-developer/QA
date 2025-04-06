import { authOptions } from "@/lib/auth";
import { TransactionType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

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
            take:4
        });

        return NextResponse.json({ transactions });

    } catch (error) {
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
