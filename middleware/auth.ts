// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      // Sem token válido, redireciona para login
      return redirectToLogin(req);
    }

    return NextResponse.next();
  } catch (error: any) {
    // Erro de descriptografia do JWT
    const isDecryptionError =
      error?.name === "JWEDecryptionFailed" ||
      error?.message?.includes("decryption operation failed");

    if (isDecryptionError) {
      // Remove cookies relacionados ao next-auth
      const response = redirectToLogin(req);
      response.cookies.delete("next-auth.session-token");
      response.cookies.delete("__Secure-next-auth.session-token");
      response.cookies.delete("next-auth.csrf-token");
      return response;
    }

    // Outros erros também redirecionam, por segurança
    return redirectToLogin(req);
  }
}

function redirectToLogin(req: NextRequest) {
  const loginUrl = new URL("/auth/login", req.url);
  loginUrl.searchParams.set("reload", "1");
  return NextResponse.redirect(loginUrl);
}

