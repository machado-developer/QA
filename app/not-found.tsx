"use client";
import React from "react";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";



const NotFound = () => {
    const router = useRouter();
    return (
        <div className="flex justify-center items-center h-screen bg-gradient-to-r from-green-400 to-[#166D37]">
            <div className="flex flex-col items-center space-y-3 bg-white/10 p-6 rounded-lg shadow-lg">
                <div className="animate-bounce">
                    <AlertTriangle className="w-14 h-14 text-white" />
                </div>

                {/* Texto de página não encontrada */}
                <p className="text-white text-lg font-semibold">Página não encontrada</p>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-gray-700"
                >
                    Voltar
                </button>

                
            </div>
        </div>
    );
};

export default NotFound;