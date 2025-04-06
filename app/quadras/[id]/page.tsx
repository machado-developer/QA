
'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import StarRating from '@/components/ui/starRating'
import ReservaModal from '@/components/reservaModal'
import ImageQuadra from "@/app/assets/image/atletas.svg"
import { useState } from 'react'

const horarios = [
    { inicio: '08:00', fim: '09:00', disponivel: true },
    { inicio: '09:00', fim: '10:00', disponivel: false },
    { inicio: '10:00', fim: '11:00', disponivel: true },
    { inicio: '10:00', fim: '11:00', disponivel: true },
]

// Mock para simular busca de dados
const mockQuadras = [
    {
        id: '1',
        name: 'Quadra Central',
        image: ImageQuadra,
        price: 'Kz 5.000 / hora',
        address: 'Rua do Estádio, Luanda',
        description: 'Espaço amplo com piso sintético e iluminação noturna.',
        rating: 4,
    },
    {
        id: '2',
        name: 'Arena do Sol',
        image: ImageQuadra,
        price: 'Kz 4.500 / hora',
        address: 'Avenida Marginal, Benguela',
        description: 'Excelente para partidas noturnas e eventos esportivos.',
        rating: 5,
    },
    {
        id: '',
        name: 'Arena do Sol',
        image: ImageQuadra,
        price: 'Kz 4.500 / hora',
        address: 'Avenida Marginal, Benguela',
        description: 'Excelente para partidas noturnas e eventos esportivos.',
        rating: 5,
    },
    {
        id: '4',
        name: 'Arena do Sol',
        image: ImageQuadra,
        price: 'Kz 4.500 / hora',
        address: 'Avenida Marginal, Benguela',
        description: 'Excelente para partidas noturnas e eventos esportivos.',
        rating: 5,
    },
]

// export async function generateStaticParams() {
//     return mockQuadras.map((quadra) => ({ id: quadra.id }))
// }

export default function QuadraPage({ params }: { params: { id: string } }) {
    const [modalAberto, setModalAberto] = useState(false)
 
    const quadra = mockQuadras.find((q) => q.id === params.id)

    if (!quadra) {
        return <p>Quadra não encontrada.</p>
    }

    return (
        <>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-blue-800">{quadra.name}</h1>

                <Image
                    src={quadra.image}
                    alt={quadra.name}
                    width={1000}
                    height={400}
                    className="w-full rounded-lg object-cover max-h-[400px]"
                />

                <div className="flex flex-col gap-2 text-gray-700">
                    <p className="text-lg font-semibold text-red-600">{quadra.price}</p>
                    <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        {quadra.address}
                    </p>
                    <p className="text-sm">{quadra.description}</p>
                </div>

                <div className="pt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Avaliações:</p>
                    <StarRating rating={quadra.rating} />
                </div>

                <div className="pt-6">
                    <button onClick={() => setModalAberto(true)} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-500 transition duration-200">
                        Reservar agora
                    </button>
                </div>

                <ReservaModal
                    isOpen={modalAberto}
                    onClose={() => setModalAberto(false)}
                    quadraId={quadra.id}
                    quadraNome={quadra.name}
                />
            </div>


        </>
    )
}
