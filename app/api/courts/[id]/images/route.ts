import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// Definindo o schema de validação para as imagens da quadra
const courtImagesSchema = z.object({
    // Adicionando courtId
    courtImages: z.array(z.string().url()) // Array de URLs das imagens
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // Verifica a sessão do usuário
        const courtId = (await (params)).id
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Obtém o corpo da requisição e valida com o schema
        const body = await req.json();
        const data = courtImagesSchema.parse(body); // Verifica e valida os dados

        console.log("DATA", data);

        // Criação das imagens associadas a uma quadra
        const created = await prisma.courtImage.createMany({
            data: data.courtImages.map((url) => ({
                courtId, // Associa o ID da quadra
                url: url
            })),
        });

        // Retorna a resposta com sucesso
        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        // Verifica erros específicos de validação de dados
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: "Invalid data", details: error.errors }, { status: 400 });
        }

        // Log de erro para depuração
        console.error(error);

        // Retorna erro genérico de servidor
        return NextResponse.json({ message: "Internal error" }, { status: 500 });
    }
}
