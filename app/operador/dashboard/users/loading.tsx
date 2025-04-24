"use client";

import { DollarSign } from "lucide-react";

const Loading = () => {
  return (
    <div className="flex justify-center items-center h-screen  ">
      <div className="flex flex-col items-center space-y-3 bg-white/10 p-6 rounded-lg shadow-lg">
        {/* Ícone de finanças girando */}
        <div className="animate-spin">
          <DollarSign className="w-14 h-14 text-white" />
        </div>

        {/* Texto carregando */}
        <p className="text-white text-lg font-semibold">Carregando...</p>
      </div>
    </div>
  );
};

export default Loading;
