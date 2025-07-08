import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status") || undefined;
        const userId = session?.user?.id
        const search = searchParams.get("search") || undefined;
        const startDate = searchParams.get("startDate") || undefined;
        const endDate = searchParams.get("endDate") || undefined;


        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const skip = (page - 1) * limit;

        const where: {
            status?: BookingStatus;
            userId?: string;
            description?: { contains: string; mode: "insensitive" };
            createdAt?: { gte?: Date; lte?: Date };
            date?: { gte?: Date; lte?: Date };
            endTime?: {}
            startTime?: {}
        } = {
            ...(status ? { status: status as BookingStatus } : {}),
            ...(userId ? { userId } : {}),
            ...(search ? { description: { contains: search, mode: "insensitive" } } : {}),
        };

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }


        const [bookings, total] = await Promise.all([
            prisma.booking.findMany({
                where,
                include: {
                    user: true,
                    court: true,
                    availability: true,
                    payment: true,
                },
                orderBy: {
                    createdAt: "desc",
                }, skip,
                take: limit,
            }),
            prisma.booking.count({ where }),

        ]

        )

        return NextResponse.json({ bookings });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}