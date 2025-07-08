import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


const availabilityArraySchema = z.array(
    z.object({
        date: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        courtId: z.string().uuid("O ID da quadra deve ser um UUID válido."),
    }).refine((item) => {
        const start = parseToUTC(item.date, item.startTime);
        const end = parseToUTC(item.date, item.endTime);
        return start < end;
    }, {
        message: "O horário de início deve ser anterior ao término.",
        path: ["endTime"],
    }).refine((item) => {
        const start = parseToUTC(item.date, item.startTime);
        return start > new Date();
    }, {
        message: "O horário de início deve ser no futuro.",
        path: ["startTime"],
    })
);

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        if (!Array.isArray(body) || body.length === 0) {
            return NextResponse.json({ message: "Envie pelo menos uma disponibilidade." }, { status: 400 });
        }

        const data = availabilityArraySchema.parse(body);

        const courtId = data[0].courtId;
        const date = data[0].date;

        const isConsistent = data.every(
            (item) => item.courtId === courtId && item.date === date
        );

        if (!isConsistent) {
            return NextResponse.json({
                message: "Todos os agendamentos devem ter a mesma quadra e data.",
            }, { status: 400 });
        }

        const created = await prisma.$transaction(
            data.map((item) => {
                const start = parseToUTC(item.date, item.startTime);
                const end = parseToUTC(item.date, item.endTime);

                return prisma.availability.create({
                    data: {
                        date: new Date(item.date),
                        startTime: start,
                        endTime: end,
                        period: getPeriod(item.startTime),
                        createdById: session.user.id,
                        courtId: item.courtId,
                    },
                });
            })
        );

        return NextResponse.json({ created }, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({
                message: "Erro de validação",
                errors: error.errors,
            }, { status: 400 });
        }

        console.error("Erro ao criar disponibilidades:", error);
        return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 });
    }
}

const availabilitySchemaEdit = z.array(
    z.object({
        date: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        courtId: z.string().uuid("O ID da quadra deve ser um UUID válido."),
    }).refine((data) => {
        const start = parseToUTC(data.date, data.startTime);
        const end = parseToUTC(data.date, data.endTime);
        return start < end;
    }, {
        message: "O horário de início deve ser anterior ao horário de término.",
        path: ["endTime"],
    }).refine((data) => {
        const now = new Date();
        const start = parseToUTC(data.date, data.startTime);
        return start > now;
    }, {
        message: "O horário de início deve ser no futuro.",
        path: ["startTime"],
    })
);


export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        console.log("DAADOS DO BODY", body);


        if (!Array.isArray(body) || body.length === 0) {
            return NextResponse.json({ message: "O corpo deve ser um array com pelo menos um item." }, { status: 400 });
        }

        const data = availabilitySchemaEdit.parse(body);

        const courtId = data[0].courtId;
        const date = data[0].date;

        // Verifica consistência entre todos os agendamentos
        const isConsistent = data.every(
            (item) => item.courtId === courtId && item.date === date
        );

        if (!isConsistent) {
            return NextResponse.json({
                message: "Todos os agendamentos devem ter a mesma quadra e data.",
            }, { status: 400 });
        }

        // Define intervalo da data completa
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        // Inicia transação: deletar tudo + recriar
        interface AvailabilityInput {
            date: string;
            startTime: string;
            endTime: string;
            courtId: string;
        }

        interface AvailabilityCreated {
            id: string;
            date: Date;
            startTime: Date;
            endTime: Date;
            period: "TARDE" | "MANHA" | "NOITE";
            createdById: string;
            courtId: string;
            // Add other fields returned by Prisma if needed
        }

        const result: AvailabilityCreated[] = await prisma.$transaction(async (tx) => {
            // Apaga todas as disponibilidades antigas da quadra na data
            await tx.availability.deleteMany({
                where: {
                    courtId,
                },
            });

            // Cria novas
            const created: AvailabilityCreated[] = await Promise.all(
                data.map((item: AvailabilityInput) => {
                    const start: Date = parseToUTC(item.date, item.startTime);
                    const end: Date = parseToUTC(item.date, item.endTime);

                    return tx.availability.create({
                        data: {
                            date: new Date(item.date),
                            startTime: start,
                            endTime: end,
                            period: getPeriod(item.startTime),
                            createdById: session.user.id,
                            courtId: item.courtId,
                        },
                    }) as Promise<AvailabilityCreated>;
                })
            );

            return created;
        });

        return NextResponse.json({ created: result }, { status: 201 });

    } catch (error) {
        // if (error instanceof z.ZodError) {
        //     return NextResponse.json({
        //         message: "Validação falhou",
        //         errors: error.errors,
        //     }, { status: 400 });
        // }
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    message: "Dados inválidos",
                    issues: error.issues,  // issues é um array com { path, message, code }
                },
                { status: 400 }
            );
        }

        console.error("Erro ao atualizar disponibilidades:", error);
        return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 });
    }
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
function parseToUTC(date: string, time: string) {
    return new Date(`${date}T${time}:00Z`);
}

function getPeriod(startTime: string): "TARDE" | "MANHA" | "NOITE" {
    const hour = parseInt(startTime.split(":")[0]);
    if (hour < 12) return "MANHA";
    if (hour < 18) return "TARDE";
    return "NOITE";
}