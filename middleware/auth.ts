import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import withAuth, { NextRequestWithAuth } from "next-auth/middleware";

export async function authMiddleware(req: NextRequest) {
    // Permite chamadas para a API sem autenticação
    if (req.nextUrl.pathname.startsWith("/api/categories")) {
        return NextResponse.next()
    }

    return withAuth({
        pages: {
            signIn: "/auth/login",
        },
    })(req as NextRequestWithAuth, {} as any)
}
