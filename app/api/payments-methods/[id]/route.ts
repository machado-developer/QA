import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import logAction from "@/services/auditService";
import { authOptions } from "@/lib/auth";


const prisma = new PrismaClient();

const paymentschema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const data = paymentschema.parse(body);

        const id = (await params).id; // Await the params promise to get the id

        const paymentMethodConfig = await prisma.paymentMethodConfig.update({
            where: { id },
            data: {
                name: data.name,

            },
        });
        await logAction(session?.user?.id, "Actualização de Metodo de pagamento", `Name: ${data.name}, ID: ${id}`);

        return NextResponse.json(paymentMethodConfig, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: "Invalid input data" },
                { status: 400 }
            );
        }
        console.error("Error details:", {
            message: (error as any).message,
            stack: (error as any).stack,
            name: (error as any).name,
            ...(error as any),
        });
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const id = (await params).id; // Await the params promise to get the id

        await prisma.paymentMethodConfig.delete({
            where: { id },
        });
        await logAction(session?.user?.id, "Eliminação de metodo de pagamento", `ID: ${id}`);

        return NextResponse.json({ message: "metodo de pagamento deleted" }, { status: 200 });
    } catch (error) {
        console.log("Error details:", {
            message: (error as any).message,
            stack: (error as any).stack,
            name: (error as any).name,
            ...(error as any),
        });
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}