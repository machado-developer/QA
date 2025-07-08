// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes: Record<string, string[]> = {
    admin: ["/admin"],
    cliente: ["/cliente"],

};

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const role = token?.role as string;
        const pathname = req.nextUrl.pathname;

        if (!token) {
            return NextResponse.redirect(new URL("/login", req.url));
        }



        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

// Middleware será aplicada às rotas abaixo
export const config = {
    matcher: [
        "/",
        "/admin/:path*",
        "/perfil/:path*",
    ],
};
