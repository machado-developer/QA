"use client";

import { DollarSign } from "lucide-react";

interface LoadingProps {
    title?: string;
}

const Loading: React.FC<LoadingProps> = ({ title = "Verificando token" }: LoadingProps) => {
    return (
        <div className="flex justify-center items-center h-screen  flex items-center justify-center min-h-screen bg-gradient-to-r from-green-600 to-green-800 text-white py-40  ">
            <div className="flex flex-col items-center space-y-3 bg-white/10 p-6 rounded-lg shadow-lg">
                {/* Ícone de finanças girando */}
                <div className="animate-spin">
                    <DollarSign className="w-14 h-14 text-white" />
                </div>

                {/* Texto carregando */}
                <h1 className="text-white text-lg font-semibold">{title}</h1>
            </div>
        </div>
    );
};

export default Loading;
