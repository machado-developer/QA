import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import logAction from "@/services/auditService"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const methodSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }


    const methods = await prisma.paymentMethodConfig.findMany({
      include: {
        payments: true,
      },
      orderBy: {
        name: "asc",
      },
    });


    return NextResponse.json({ methods });
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



export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const data = methodSchema.parse(body)
    const userId = session?.user?.id;
    const payme = await prisma.paymentMethodConfig.create({
      data: {
        name: data.name,
      },
    })

    // Registrar log no backend
    await logAction(userId, "Novo metodo de pagamento", `nome: ${payme.name}, `);
    return NextResponse.json(payme, { status: 201 })
  } catch (error) {

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input data" },
        { status: 400 }
      )
    }
    console.log("Error details:", {
      message: (error as any).message,
      stack: (error as any).stack,
      name: (error as any).name,
      ...(error as any),
    });
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
