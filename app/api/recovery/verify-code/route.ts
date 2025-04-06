import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Verificação do código
export async function POST(req: NextRequest) {
    const { email, token } = await req.json();
    const user = await prisma.user.findUnique({
        where: { email }
    })
    if (!user) {
        return NextResponse.json({ error: "usuário inválido" }, { status: 400 })
    }
    const codeVerifyed = await prisma.passwordResetToken.findUnique({
        where: { token, userId: user.id }
    })

    if (!codeVerifyed || codeVerifyed.token !== token || Date.now() > new Date(codeVerifyed.expiresAt).getTime()) {
        return NextResponse.json({ message: "Código inválido ou expirado" }, { status: 400 });
    }

    return NextResponse.json({ message: "Código verificado" }, { status: 200 });
}

