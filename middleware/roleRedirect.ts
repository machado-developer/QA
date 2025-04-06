import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { log } from "console";

export async function roleRedirectMiddleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (req.nextUrl.pathname.startsWith("/admin") && token) {
    console.log("Token:", token);
    console.log("Token role:", token.role);
    if (token?.role !== "ADMINISTRADOR") {
      console.log("Token role:", token.role);
      return NextResponse.redirect(new URL("/perfil/dash", req.url));

    }
    return NextResponse.next();
  }
  return NextResponse.next();
}
