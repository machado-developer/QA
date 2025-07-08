"use client";
// pages/unauthorized.tsx
import Link from "next/link";
import { useRouter } from "next/navigation";


export default function UnauthorizedPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
            <h1 className="text-5xl font-bold text-red-600 mb-4">403- Somente para administrador</h1>
            <p className="text-xl text-gray-700 mb-6">Acesso não autorizado</p>
            <p className="text-gray-500 mb-8 text-center max-w-md">
                Você não tem permissão para acessar esta página.
            </p>
            <button
                onClick={() => {
                    router.back();
                    setTimeout(() => router.back(), 0);
                }}
                className="inline-block px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
                Voltar para a página anterior
            </button>
        </div>
    );
}
