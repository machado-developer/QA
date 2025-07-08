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
  if (req.nextUrl.pathname.startsWith("/admin")) {
    // Redireciona para sua dashboard correta
    let redirectTo = "";
    if (role === "administrador") return NextResponse.next();
    else if (role === "cliente") redirectTo = "/perfil";

    if (redirectTo && req.nextUrl.pathname !== redirectTo) {
      return NextResponse.redirect(new URL(redirectTo, req.url));
    }
  }

  if (req.nextUrl.pathname.startsWith("/") && req.nextUrl.pathname.length === 0 && role !== "cliente") {
    // Redireciona para sua dashboard correta
    let redirectTo = "/admin/dashboard/books";
    if (role === "administrador") redirectTo = "/admin/dashboard";

    return NextResponse.redirect(new URL(redirectTo, req.url));

  }


  if (req.nextUrl.pathname === "/admin/dashboard" && req.nextUrl.pathname.length <= 0 && role !== "cliente") {
    // Redireciona para sua dashboard correta
    if (role === "operador")
      return NextResponse.redirect(new URL("/admin/dashboard/books", req.url));
    return NextResponse.next()
  }

  if (req.nextUrl.pathname.startsWith("/perfil") && role !== "cliente") {
    // Redireciona para sua dashboard correta
    let redirectTo = "/admin/dashboard";
    if (role === "administrador") redirectTo = "/admin/dashboard";
    else if (role === "operador") redirectTo = "/admin/dashboard/books";
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  if (req.nextUrl.pathname.startsWith("/perfil") && role === "cliente") {
    // Redireciona para sua dashboard correta


    return NextResponse.next();
  }


  return NextResponse.next(); // Tudo certo, segue o fluxo
}
