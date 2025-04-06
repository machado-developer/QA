'use client'

import { useState } from 'react'
import ReservaModal from '../reservaModal'


interface ReservaButtonProps {
    quadraId: string
    quadraNome: string
}

export default function ReservaButton({ quadraId, quadraNome }: ReservaButtonProps) {
    const [modalAberto, setModalAberto] = useState(false)

    return (
        <>
            <button
                onClick={() => setModalAberto(true)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-500 transition duration-200"
            >
                Reservar agora
            </button>

            <ReservaModal
                isOpen={modalAberto}
                onClose={() => setModalAberto(false)}
                quadraId={quadraId}
                quadraNome={quadraNome}
            />
        </>
    )
}
