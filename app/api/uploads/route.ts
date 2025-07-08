import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";
import { mkdirSync, existsSync, } from "fs";
import fs from 'fs/promises'
import { prisma } from "@/lib/prisma"; // ajuste o caminho conforme sua estrutura

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("courtImages") as File[]; // nome correto
    const courtId = formData.get("courtId")?.toString();
    console.log(files);
    console.log("ID", courtId);


    if (!files || files.length === 0 || !courtId) {
      return NextResponse.json({ message: "Dados inválidos" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public/uploads");

    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const uploadedUrls: string[] = [];
    const imageDataForPrisma: { courtId: string; url: string }[] = [];

    for (const file of files) {
      if (!file || !file.name) continue;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = path.extname(file.name);
      const fileName = `${uuid()}${ext}`;
      const filePath = path.join(uploadDir, fileName);
      const imageUrl = `/uploads/${fileName}`;
      const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
      const fullImageUrl = `${baseUrl}${imageUrl}`;

      await writeFile(filePath, buffer);
      uploadedUrls.push(fullImageUrl);
      imageDataForPrisma.push({ courtId, url: fullImageUrl });
    }

    // Salva todas as imagens no banco
    const createIma = await prisma.courtImage.createMany({
      data: imageDataForPrisma.map((image) => ({
        courtId: image?.courtId,
        url: String(image.url),
      })),
    });

    console.log("CREATED",createIma);

    return NextResponse.json({ urls: uploadedUrls });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json(
      { message: "Erro ao fazer upload dos arquivos" },
      { status: 500 }
    );
  }
}




