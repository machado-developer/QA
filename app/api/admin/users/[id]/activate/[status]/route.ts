import { authOptions } from "@/lib/auth";
import logAction from "@/services/auditService";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string, status: boolean }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "ADMINISTRADOR") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const id = (await params).id; // Await the params promise to get the id
        const status = (await params).status; // Await the params promise to get the status
        
        const user = await prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 });
        }

        if (user.email === "geral@difp.com") {
            return NextResponse.json({ message: "Não é possível desativar este usuário!" }, { status: 403 });
        }

        await prisma.user.update({
            where: { id },
            data: {
                actived: status
            }, // Soft delete: apenas marca como deletado
        });
        await logAction(user.id, `USUARIO ${status ? "ATIVADO" : "DESATIVADO"}`, `nome: ${user.name}, perfil: ${user.role.toLocaleLowerCase()}`);

        return NextResponse.json({ message: "sucesso" }, { status: 200 });
    } catch (error) {
        console.error("Error details:", {
            message: (error as any).message,
            stack: (error as any).stack,
            name: (error as any).name,
            ...(error as any),
        });
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
