import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

const availabilitySchema = z.object({
    date: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    courtId: z.string().uuid(),
});

function parseToUTC(date: string, time: string) {
    return new Date(`${date}T${time}:00Z`);
}

function getPeriod(startTime: string): "TARDE" | "MANHA" | "NOITE" {
    const hour = parseInt(startTime.split(":")[0]);
    if (hour < 12) return "MANHA";
    if (hour < 18) return "TARDE";
    return "NOITE";
}
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id; // Await the params promise to get the id

        if (!id) {
            return NextResponse.json({ error: 'ID da quadra é obrigatório.' }, { status: 400 });
        }

        const { searchParams } = new URL(req.url);
        const dateParam = searchParams.get('date');

        let startDate: Date | undefined;
        let endDate: Date | undefined;

        if (dateParam) {
            startDate = new Date(dateParam);
            startDate.setHours(0, 0, 0, 0);

            endDate = new Date(dateParam);
            endDate.setHours(23, 59, 59, 999);
        }

        const availabilities = await prisma.availability.findMany({
            where: {
                courtId: id,
                ...(startDate && endDate && {
                    date: {
                        gte: startDate,
                        lte: endDate,
                    },
                }),
            },
            orderBy: {
                date: 'asc',
            },
            include: {
                court: true,
            },
        });

        if (startDate && availabilities.length === 0) {
            return NextResponse.json({
                message: 'Nenhuma disponibilidade encontrada na data informada.',
                availabilities: [],
            });
        }

        return NextResponse.json({ availabilities });
    } catch (error) {
        console.error('Erro ao buscar disponibilidade:', error);
        return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
    }
}
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const data = availabilitySchema.parse(body);

        const start = parseToUTC(data.date, data.startTime);
        const end = parseToUTC(data.date, data.endTime);

        const created = await prisma.availability.create({
            data: {
                date: new Date(data.date),
                startTime: start,
                endTime: end,
                period: getPeriod(data.startTime),
                createdById: session.user.id,
                courtId: data.courtId,
            },
        });

        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: "Invalid data" }, { status: 400 });
        }
        console.error(error);
        return NextResponse.json({ message: "Internal error" }, { status: 500 });
    }
}
