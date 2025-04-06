import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function POST(req: NextRequest) {
    const { email } = await req.json();

    // Verifica se o e-mail está registrado
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "Se o email estiver cadastrado, enviaremos um código" }, { status: 400 });

    // Gera código de 5 dígitos
    const token = Math.floor(10000 + Math.random() * 90000).toString();
    await prisma.passwordResetToken.create({ data: { userId: user.id, token, expiresAt: new Date(Date.now() + 60 * 1000) } });

    console.log(`Código enviado para ${email}: ${token}`); // Simula envio de email

    return NextResponse.json({ message: "Código enviado com sucesso" }, { status: 200 });
}

