import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "./middleware/auth";
import { roleRedirectMiddleware } from "./middleware/roleRedirect";
import { getToken } from "next-auth/jwt";
import { log } from "console";


export async function middleware(req: NextRequest) {

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (req.nextUrl.pathname.startsWith("/auth/login") && token) {
    console.log("Token:", token);
    console.log("Token role:", token.role);
    const redirectTo =
      String(token.role).toLocaleLowerCase() === "administrador"
        ? "/admin/dashboard"
        : String(token.role).toLocaleLowerCase() === "cliente"
          ? "/perfil/dash"
          : "/perfil/dash";

    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  let response = await authMiddleware(req);
  if (response && response.status !== 200) return response;

  response = await roleRedirectMiddleware(req);
  if (response && response.status !== 200) return response;

  return response;
}

// Define os caminhos que o middleware vai proteger
export const config = {
  matcher: ["/perfil/:path*", "/admin/:path*",],
};
