import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";



export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user.role !== "ADMINISTRADOR" && session.user.role !== "OPERADOR")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Quadras mais reservadas
        const mostBookedCourts = await prisma.booking.groupBy({
            by: ["courtId"],
            _count: { courtId: true },
            orderBy: { _count: { courtId: "desc" } },
            take: 5,
        });

        const courts = await prisma.court.findMany({
            where: {
                id: { in: mostBookedCourts.map((b) => b.courtId) },
            },
        });

        const topCourts = mostBookedCourts.map((b) => {
            const court = courts.find((c) => c.id === b.courtId);
            return {
                id: court?.id,
                name: court?.name,
                reservas: b._count.courtId,
            };
        });

        // Categorias mais reservadas
        const bookingsWithCategories = await prisma.booking.findMany({
            select: {
                court: {
                    select: {
                        category: true,
                    },
                },
            },
        });

        const categoryCountMap: Record<string, number> = {};
        for (const booking of bookingsWithCategories) {
            for (const category of booking.court.category) {
                categoryCountMap[category.id] = (categoryCountMap[category.id] || 0) + 1;
            }
        }

        const sortedCategoryCounts = Object.entries(categoryCountMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const categories = await prisma.category.findMany({
            where: {
                id: { in: sortedCategoryCounts.map(([id]) => id) },
            },
        });

        const topCategories = sortedCategoryCounts.map(([id, count]) => {
            const category = categories.find((c) => c.id === id);
            return {
                id: category?.id,
                name: category?.name,
                bookings: count,
            };
        });

        const allCourts = await prisma.court.findMany();
        const allCategories = await prisma.category.findMany();

        return NextResponse.json({
            topCourts,
            topCategories,
            allCourts,
            allCategories,
        });
    } catch (error) {
        console.error("Erro ao buscar estatísticas de quadras:", error);
        return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
    }
}

