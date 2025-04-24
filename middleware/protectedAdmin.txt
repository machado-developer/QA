import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function protectAdminRoutesMiddleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    const role = token?.role || null; // Get the role from the token, or null if not present

    if (pathname.startsWith("/admin") && String(role).toLocaleLowerCase() !== "administrador") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
}
