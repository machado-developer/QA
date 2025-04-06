import { PrismaClient } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import logAction from "@/services/auditService"


const prisma = new PrismaClient()

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {

        const id = (await params).id; // Await the params promise to get the id
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== "ADMINISTRADOR") {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }


        if (!id) {
            return NextResponse.json(
                { message: "User ID is required" },
                { status: 400 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        })

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({ user })
    } catch (error) {
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "ADMINISTRADOR") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const id = (await params).id; // Await the params promise to get the id
        const user = await prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 });
        }

        if (user.email === "geral@difp.com") {
            return NextResponse.json({ message: "Não é possível apagar este usuário!" }, { status: 403 });
        }

        await prisma.user.delete({
            where: { id },
            // Soft delete: apenas marca como deletado
        });
        await logAction(user.id, "USUARIO DELETADO", `nome: ${user.name}, perfil: ${user.role.toLocaleLowerCase()}`);

        return NextResponse.json({ message: "Usuário arquivado com sucesso" }, { status: 200 });
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


export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {

        const id = (await params).id; // Await the params promise to get the id
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== "ADMINISTRADOR") {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const { name, email, role, password } = await request.json()

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { name, email, role, password },
        })

        return NextResponse.json(
            { message: "User updated successfully", user: updatedUser },
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