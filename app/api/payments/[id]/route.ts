import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = {
    params: {
        id: string;
    };
};

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
