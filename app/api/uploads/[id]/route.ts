import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from 'fs/promises';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { searchParams } = new URL(req.url);
        const id = (await (params)).id

        if (!id) {
            return NextResponse.json({ message: "ID da imagem não fornecido" }, { status: 400 });
        }

        // Busca a imagem no banco para obter a URL
        const image = await prisma.courtImage.findUnique({
            where: { id },
        });

        if (!image) {
            return NextResponse.json({ message: "Imagem não encontrada" }, { status: 404 });
        }

        // Remove do banco
        await prisma.courtImage.delete({
            where: { id },
        });

        // Remove o arquivo físico
        const imagePath = path.join(process.cwd(), "public", image.url.replace(/^\/+/, ""));
        await fs.unlink(imagePath).catch(() => {
            console.warn("Arquivo não encontrado para exclusão:", imagePath);
        });

        return NextResponse.json({ message: "Imagem removida com sucesso" });
    } catch (error) {
        console.error("Erro ao excluir imagem:", error);
        return NextResponse.json(
            { message: "Erro ao excluir imagem" },
            { status: 500 }
        );
    }
}