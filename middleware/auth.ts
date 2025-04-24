// middleware/auth.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function authMiddleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    // Não autenticado: redireciona para login
    const loginUrl = new URL("/auth/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next(); // Autenticado: segue normalmente
}
