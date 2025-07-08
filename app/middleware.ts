import { withAuth, NextRequestWithAuth } from "next-auth/middleware"
import { NextRequest, NextResponse } from "next/server"

export default function middleware(req: NextRequest) {
    // Permite chamadas para a API sem autenticação
    if (req.nextUrl.pathname.startsWith("/api/categories")) {
        return NextResponse.next()
    }
    
    

    return withAuth({
        pages: {
            signIn: "/login",
        },
    })(req as NextRequestWithAuth, {} as any)
}
