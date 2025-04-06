import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
"@/lib/auth";


export async function PUT(req: Request,) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = session?.user?.id;
        const { name, email } = await req.json();

        const updatedProfile = await prisma.user.update({
            where: { id: userId },
            data: { name, email },
        });

        return NextResponse.json({ profile: updatedProfile }, { status: 200 });

    } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        return NextResponse.json(
            { error: "Erro ao atualizar dados do usuário" },
            { status: 500 }
        );
    }
}