 
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from "next/server";

// Reset da senha
export async function POST(req: NextRequest) {
    const { email, password, } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 });

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { email }, data: { password: hashedPassword } });

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    return NextResponse.json({ message: "Senha alterada com sucesso" }, { status: 200 });
}