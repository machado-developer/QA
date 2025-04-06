// components/QuadraCard.tsx
import { Divide, Map } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useState } from 'react'
import StarRating from './starRating'
import Link from 'next/link'
type Quadra = {
    id: string
    name: string
    image: string
    price: string,
    address: string,
    description?: string,
    rating?: number,
    category?: string
}

export default function QuadraCard({ quadra }: { quadra: Quadra }) {
    const [userRating, setUserRating] = useState<number>(quadra.rating ?? 0)
    return (
        <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl cursor-pointer transition-shadow duration-300 w-full"
        >
            <div className="bg-white shadow-md rounded-lg overflow-hidden w-full">
                <Image src={quadra.image} alt={quadra.name} className="w-full    object-cover" width={400} height={200} />
                <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800">{quadra.name}</h3>
                    <p className="text-red-500 font-medium">{quadra.price}</p>

                    <div className="flex items-center mt-2">
                        <Map className="text-gray-500" size={16} />
                        <p className="text-gray-500 ml-1">{quadra.address}</p>
                    </div>

                    <p className="text-gray-500 mt-2">{quadra.description}</p>
                    <div className="pt-2">
                        <StarRating rating={userRating} onRate={(value) => setUserRating(value)} />
                    </div>
                    <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <button className="bg-green-600 text-white px-2 py-1 rounded-md hover:bg-green-500 transition duration-200 w-full sm:w-auto size-sm">
                            Reservar
                        </button>
                        <span className="text-gray-500 text-sm w-full sm:w-auto text-center sm:text-left">
                            <Link className="text-sm text-blue-600 hover:underline text-[12px]" href={`/quadras/${quadra.id}`}>
                                Ver detalhes
                            </Link>
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
