import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {

        const id = (await params).id; // Await the params promise to get the id
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const { password, new_password } = await request.json()

        if (!password || !new_password) {
            return NextResponse.json(
                { message: "Senha atual e nova senha são obrigatórias." },
                { status: 400 }
            );
        }

        if (password === new_password) {
            return NextResponse.json(
                { message: "A nova senha deve ser diferente da senha atual." },
                { status: 400 }
            );
        }

        // Aqui você pode adicionar validações adicionais, como tamanho mínimo, caracteres especiais, etc.
        if (new_password.length < 8) {
            return NextResponse.json(
                { message: "A nova senha deve ter pelo menos 8 caracteres." },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            return NextResponse.json(
                { message: "Usuário não encontrado." },
                { status: 404 }
            );
        }

        // Verifica se a senha atual está correta
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { message: "Senha atual incorreta." },
                { status: 400 }
            );
        }
        const hashedPassword = await bcrypt.hash(new_password, 10)
        const updatedUser = await prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        })

        return NextResponse.json(
            { message: "Usuario actualizado", user: updatedUser },
            { status: 200 }
        )
    } catch (error) {
        console.error("Error details:", {
            message: (error as any).message,
            stack: (error as any).stack,
            name: (error as any).name,
            ...(error as any),
        });
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        )
    }
}