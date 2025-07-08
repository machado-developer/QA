import { NextRequest, NextResponse } from "next/server";
import authMiddleware from "@/middleware/auth"
import roleRedirectMiddleware from "@/middleware/roleRedirect"
import { getToken } from "next-auth/jwt";

// MIDDLEWARE CENTRAL
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const role = String(token?.role).toLocaleLowerCase();
  // LOGIN REDIRECT — Apenas para /auth/login
  if (pathname === "/auth/login") {
    if (token) {


      const redirectTo =
        role === "administrador"
          ? "/admin/dashboard"
          : role === "operador"
            ? "/operador/dashboard"
            : "/perfil"; // Fallback para cliente

      return NextResponse.redirect(new URL(redirectTo, req.url));
    }

    return NextResponse.next(); // Deixa acessar login se não estiver logado
  }

  // ROTAS ADMIN — executa auth + roleRedirect
  if (pathname.startsWith("/admin")) {
    const authRes = await authMiddleware(req);
    if (authRes && authRes.status !== 200) return authRes;

    const roleRes = await roleRedirectMiddleware(req);
    if (roleRes && roleRes.status !== 200) return roleRes;

    return NextResponse.next();
  }

  if (pathname === ("/") && pathname.length <= 0 && token && role !== "cliente") {
    const authRes = await authMiddleware(req);
    return NextResponse.redirect("/auth/login")

  }

  if (pathname.startsWith("/perfil") && token) {
    const authRes = await authMiddleware(req);
    if (authRes && authRes.status !== 200) return authRes;

    const roleRes = await roleRedirectMiddleware(req);
    if (roleRes && roleRes.status !== 200) return roleRes;

    return NextResponse.next();
  }


  // ROTAS PERFIL — apenas authMiddleware
  if (pathname.startsWith("/perfil")) {
    const authRes = await authMiddleware(req);
    if (authRes && authRes.status !== 200) return authRes;

    return NextResponse.next();
  }

  // Outras rotas seguem normalmente
  return NextResponse.next();
}

// Define somente as rotas que devem passar por essa lógica
export const config = {
  matcher: ["/auth/login", "/admin/:path*", "/perfil/:path*",],
};
