import Image from 'next/image'
import { MapPin } from 'lucide-react'
import StarRating from '@/components/ui/starRating'
import ReservaModal from '@/components/reservaModal'
import { mockQuadras } from '@/app/mock/mockQuadras'

interface QuadraPageProps {
  params: {
    id: string
  }
}

export default function QuadraPage({ params }: QuadraPageProps) {
  const quadra = mockQuadras.find((q) => q.id === params.id)

  if (!quadra) {
    return <p>Quadra não encontrada.</p>
  }

  return (
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

      {/* 
        Se o modal de reserva for Client Component (com useState), 
        envolva ele num <ClientWrapper> ou extraia o botão para um componente separado.
      */}
    </div>
  )
}
