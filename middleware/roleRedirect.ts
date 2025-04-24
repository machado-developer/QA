// middleware/roleRedirect.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function roleRedirectMiddleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    // Caso algo falhe no token
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const role = String(token.role).toLowerCase();

  // Exemplo de permissão: apenas administradores podem acessar "/admin"
  if (req.nextUrl.pathname.startsWith("/admin") && role !== "administrador") {
    // Redireciona para sua dashboard correta
    const redirectTo =
      role === "operador"
        ? "/operador/dashboard"
        : "/perfil/dash"; // cliente, visitante etc.

    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  return NextResponse.next(); // Tudo certo, segue o fluxo
}
