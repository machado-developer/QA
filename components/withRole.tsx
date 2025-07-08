// components/withRole.tsx
"use client"

import Loading from "@/loading"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function withRole(Component: React.ComponentType, allowedRoles: string[]) {
    return function RoleProtectedComponent(props: any) {
        const { data: session, status } = useSession()
        const router = useRouter()

        useEffect(() => {
            if (status === "loading") return

            if (!session?.user || !allowedRoles.includes(session.user.role.toLocaleLowerCase())) {
                router.push("/unauthorized") // ou página de login
            }
        }, [status, session, router])

        if (status === "loading" || !session?.user || !allowedRoles.includes(session.user.role.toLocaleLowerCase())) {
            return <Loading></Loading>
        }

        return <Component {...props} />
    }
}
