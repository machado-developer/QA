
import NextAuth from "next-auth";

import { authOptions } from "@/lib/auth";
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            image?: string;
            role: string;
        };
    }
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
