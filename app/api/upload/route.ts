import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";
import { mkdirSync, existsSync } from "fs";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file || !file.name) {
            return NextResponse.json({ message: "Nenhum arquivo enviado" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = path.join(process.cwd(), "public/uploads");

        // Cria a pasta "uploads" se não existir
        if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
        }

        const ext = path.extname(file.name);
        const fileName = `${uuid()}${ext}`;
        const filePath = path.join(uploadDir, fileName);

        await writeFile(filePath, buffer);

        const imageUrl = `/uploads/${fileName}`;
        const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
        const fullImageUrl = `${baseUrl}${imageUrl}`;
        return NextResponse.json({ url: fullImageUrl });
    } catch (error) {
        console.error("Erro no upload:", error);
        return NextResponse.json(
            { message: "Erro ao fazer upload do arquivo" },
            { status: 500 }
        );
    }
}
