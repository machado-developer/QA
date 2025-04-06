import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import logAction from "@/services/auditService";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";



const courtImageSchema = z.object({
  courtId: z.string().uuid(),
  url: z.string().url(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = courtImageSchema.parse(body);
    const userId = session.user.id;

    const courtImage = await prisma.courtImage.create({
      data: {
        courtId: data.courtId,
        url: data.url,
        userId,
      },
    });

    await logAction(userId, "Upload de Imagem", `Imagem adicionada à quadra ${data.courtId}`);
    return NextResponse.json(courtImage, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input data" }, { status: 400 });
    }
    console.error("Error details:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
