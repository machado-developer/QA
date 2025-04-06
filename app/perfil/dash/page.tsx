'use client';

import React from 'react';

const dadosReservas = {
    pendentes: 3,
    confirmadas: 5,
    finalizadas: 2,
    canceladas: 1,
};

export default function DashboardCliente() {
    return (
        <div className="min-h-screen bg-white flex items-start justify-start px-4 py-10">
            <div className="bg-white rounded-2xl w-full max-w-3xl p-8">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                    Resumo das suas Reservas
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    <CardStatus
                        label="Pendentes"
                        count={dadosReservas.pendentes}
                        color="bg-yellow-100 text-yellow-700"
                    />
                    <CardStatus
                        label="Confirmadas"
                        count={dadosReservas.confirmadas}
                        color="bg-blue-100 text-blue-700"
                    />
                    <CardStatus
                        label="Finalizadas"
                        count={dadosReservas.finalizadas}
                        color="bg-green-100 text-green-700"
                    />
                    <CardStatus
                        label="Canceladas"
                        count={dadosReservas.canceladas}
                        color="bg-red-100 text-red-700"
                    />
                </div>
            </div>
        </div>
    );
}

function CardStatus({
    label,
    count,
    color,
}: {
    label: string;
    count: number;
    color: string;
}) {
    return (
        <div className={`rounded-xl p-6 shadow-sm ${color} text-center`}>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-3xl font-bold mt-2">{count}</p>
        </div>
    );
}
