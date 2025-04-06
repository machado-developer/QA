import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import logAction from "@/services/auditService";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const courtSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1),
    address: z.string().min(1),
    city: z.string().min(1),
    description: z.string().optional(),
    otherFields: z.record(z.any()).optional(),
    pricePerHour: z.number().min(0),
    featuredImage: z.string().url(),
    courtImages: z.array(z.string().url()).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const data = courtSchema.parse(body);
        const id = (await params).id;

        const court = await prisma.court.update({
            where: { id },
            data: {
                name: data.name,
                address: data.address,
                city: data.city,
                description: data.description,
                otherFields: data.otherFields,
                pricePerHour: data.pricePerHour,
                featuredImage: data.featuredImage,
                courtImages: {
                    deleteMany: {}, // Remove imagens antigas
                    create: data.courtImages?.map(url => ({ url, userId: session.user.id })) || [],
                },
            },
            include: {
                courtImages: true,
            },
        });

        await logAction(session.user.id, "Atualização de Quadra", `Nome: ${data.name}, Cidade: ${data.city}`);
        return NextResponse.json(court, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: "Invalid input data" }, { status: 400 });
        }
        console.error("Error details:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const id = (await params).id;
        await prisma.court.delete({ where: { id } });
        await logAction(session.user.id, "Eliminação de Quadra", `ID: ${id}`);

        return NextResponse.json({ message: "Court deleted" }, { status: 200 });
    } catch (error) {
        console.error("Error details:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
