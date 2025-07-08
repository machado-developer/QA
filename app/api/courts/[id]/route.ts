import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { z } from "zod";
import logAction from "@/services/auditService";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from 'fs/promises';

const courtSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1),
    address: z.string().min(1),
    city: z.string().min(1),
    description: z.string().min(1),
    categoryId: z.string().min(1),
    pricePerHour: z.number().nonnegative(),
    featuredImage: z.string().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        const id = (await params).id;

        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const data = courtSchema.parse(body);

        const court = await prisma.court.update({
            where: {
                id,
                createdById: session.user.id,
            },
            data: {
                name: data.name,
                address: data.address,
                city: data.city,
                description: data.description,
                pricePerHour: data.pricePerHour,
                featuredImage: data.featuredImage,
                category: {
                    set: [],
                    connect: { id: data.categoryId }
                }
            },
        });

        await logAction(session.user.id, "Actualização de Quadra", `ID: ${id}, Name: ${data.name}`);

        return NextResponse.json(court, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: "Invalid input data" }, { status: 400 });
        }

        console.error("Error details:", {
            message: (error as any).message,
            stack: (error as any).stack,
            name: (error as any).name,
            ...(error as any),
        });

        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        // if (!session?.user || !session?.user?.id) {
        //   return NextResponse.json(
        //     { message: "Unauthorized" },
        //     { status: 401 }
        //   );
        // }

        const id = (await params).id
        const court = await prisma.court.findUnique({
            where: { id },
            include: {
                courtImages: true,
                availabilities: true,
                bookings: true,
                category: true,
            },

        });

        return NextResponse.json({ court });
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
        );
    }
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        const id = (await params).id;

        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const court = await prisma.court.findUnique({
            where: {
                id,
                // createdById: session.user.id,
            },
            include: {
                bookings: true,
                availabilities: true,
            },
        });

        if (!court) {
            return NextResponse.json({ message: "Quadra não encontrada" }, { status: 404 });
        }
        if (court.bookings.some((item) => { item.status !== "CANCELADO" && item.status !== "CONCLUIDO" })) {
            return NextResponse.json({ message: "Não é possível eliminar uma quadra com reservas que não esteja cancelada ou concluida. " }, { status: 403 });
        }
        if (court.availabilities.length > 0) {
            await prisma.availability.deleteMany({
                where: {
                    courtId: id,
                },
            });
        }
        if (court.bookings.length > 0) {
            await prisma.booking.deleteMany({
                where: {
                    courtId: id,
                },
            });
        }


        const images = await prisma.courtImage.findMany({
            where: { courtId: id }
        })
        // Remove do banco
        await prisma.courtImage.deleteMany({
            where: { courtId: id },
        });

        // Remove o arquivo físico
        const uploadDir = path.join(process.cwd(), "public")
        await Promise.all(
            images.map(async (img) => {
                const imagePath = path.join(uploadDir, img.url.replace(/^\/+/, ""));
                try {
                    await fs.unlink(imagePath);
                } catch (error) {
                    console.warn("Arquivo não encontrado para exclusão:", imagePath);
                }
            })
        );

        await prisma.court.delete({
            where: {
                id,
                createdById: session.user.id,
            },
        });


        await logAction(session.user.id, "Eliminação de Quadra", `ID: ${id}`);

        return NextResponse.json({ message: "Quadra deletada com sucesso" }, { status: 200 });
    } catch (error) {
        console.error("Error details:", {
            message: (error as any).message,
            stack: (error as any).stack,
            name: (error as any).name,
            ...(error as any),
        });

        return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
    }
}
