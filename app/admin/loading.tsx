"use client";

import { Suspense } from "react";


interface LoadingProps {
  title: string;
}

const Loading = ({ title }: LoadingProps) => {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">
      <div className="flex flex-col items-center space-y-3 bg-white/10 p-6 rounded-lg shadow-lg">
        {/* Ícone esportivo animado */}
        <div className="animate-bounce">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-12 h-12 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>

        {/* Texto carregando */}
        <p className="text-white text-lg font-semibold">
          Carregando {title}...
        </p>
      </div>
    </div>}></Suspense>

  );
};

export default Loading;
