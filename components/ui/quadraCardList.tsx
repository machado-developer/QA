'use client';

import Link from "next/link";
import { useState } from "react";
import QuadraCard from "./quadraCard";

type Quadra = {
    id: string;
    name: string;
    image: string;
    price: string;
    address: string;
    description?: string;
    category?: string;
};

export default function QuadraCardList({ categoria, quadras }: { categoria: string; quadras: Quadra[] }) {
    const quadrasFiltradas = quadras.filter((quadra) => quadra.category === categoria);
    
    const itemsPerPage = 4;
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(quadrasFiltradas.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentQuadras = quadrasFiltradas.slice(startIndex, startIndex + itemsPerPage);

    if (quadrasFiltradas.length === 0) return null;

    return (
        <div className="mb-12 w-full">
            <div className="flex justify-between items-center mb-6 w-full">
                <h2 className="text-2xl font-bold text-green-800 border-b-2 border-green-600 pb-1 w-fit">
                    {categoria} <span className="text-gray-500">({quadrasFiltradas.length})</span>
                </h2>
                <Link href={`/quadras?categoria=${categoria}`} className="text-sm text-green-600 font-bold hover:underline">
                    Ver mais
                </Link>
            </div>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 w-full">
                {currentQuadras.map((quadra) => (
                    <QuadraCard key={quadra.id} quadra={quadra} />
                ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
                <div className="mt-6 flex justify-center items-center space-x-4">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-gray-600 text-white rounded-md disabled:opacity-50"
                    >
                        Anterior
                    </button>
                    <span className="text-sm text-gray-700">
                        Página {currentPage} de {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-gray-600 text-white rounded-md disabled:opacity-50"
                    >
                        Próximo
                    </button>
                </div>
            )}
        </div>
    );
}
