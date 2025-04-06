import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = session?.user?.id;

        const profile = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });

        if (!profile) {
            return NextResponse.json(
                { message: "Usuário não encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json({ profile }, { status: 200 });

    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        return NextResponse.json(
            { error: "Erro ao buscar dados do usuário" },
            { status: 500 }
        );
    }
}
