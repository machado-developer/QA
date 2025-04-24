import logAction from "@/services/auditService"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma";


const registerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["CLIENTE", "ADMINISTRADOR","OPERADOR"]).default("CLIENTE")
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, role = "CLIENTE" } = registerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,

      },
    })
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id ? session?.user?.id : user.id;



    await logAction(userId, "Novo usuario registado", `nome: ${user.name}, perfil: ${role.toLocaleLowerCase()}`);

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    )
  } catch (error) {

    if (error instanceof z.ZodError) {
      console.log("Error details:", {
        message: (error as any).message,
        stack: (error as any).stack,
        name: (error as any).name,
        ...(error as any),
      });
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