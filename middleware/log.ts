import { NextRequest, NextResponse } from "next/server";

export function logMiddleware(req: NextRequest) {
    if (process.env.NODE_ENV === "development") {
        console.log(`[LOG] ${req.method} ${req.nextUrl.pathname}`);
    }

    return NextResponse.next();
}
