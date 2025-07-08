// components/QuadraCard.tsx
"use client"
import { Divide, Map } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Suspense, useEffect, useState } from 'react'
import StarRating from './starRating'
import Link from 'next/link'
import { Button } from './button'
import Loading from '@/loading'
import { useSession } from "next-auth/react";
type Quadra = {
    id: string;
    name: string;
    featuredImage: string;
    pricePerHour: number;
    city?: string,
    address: string;
    description?: string;
    rating: number,
    category?: {
        id: string,
        name: string
    }[];
    courtImages: { id: string; courtId: string; userId: string | null; url: string; createdAt: string; }[];
}

export default function QuadraCard({ quadra }: { quadra: Quadra }) {

    const { data: session } = useSession();
    const [logado, setLogado] = useState(false)
    useEffect(() => {
        if (session?.user) {
            setLogado(true)
        }
    })
    const [userRating, setUserRating] = useState<number>(quadra.rating ?? 0)
    return (
        <Suspense fallback={<Loading></Loading>}>

            <div className="bg-white shadow-md rounded-lg overflow-hidden w-48 mr-2 transition hover:shadow-lg">
                <Image src={quadra.featuredImage} alt={quadra.name} className="w-full    object-cover" width={400} height={500} />
                <div className="p-2">
                    <h3 className="text-sm font-semibold text-gray-800">{quadra.name}</h3>
                    <p className="text-red-500 font-medium text-xs">{quadra.pricePerHour}</p>

                    <div className="flex items-center mt-2">
                        <Map className="text-gray-500 " size={14} />
                        <p className="text-gray-500 ml-1 text-xs">{quadra.address}</p>
                    </div>

                    <p className="text-gray-500  text-xs mt-2">
                        {quadra.description
                            ? `${quadra.description.split(" ").slice(0, 5).join(" ")}${quadra.description.split(" ").length > 5 ? "..." : ""}`
                            : ""}
                    </p>

                    <div className="">
                        <StarRating rating={userRating} onRate={(value) => setUserRating(value)} />
                    </div>

                    <Button className="bg-green-600 text-white mt-2 px-2 py-1 rounded-md hover:bg-green-500 transition duration-200 w-full sm:w-auto size-sm">
                        {logado ? (
                            <Link className="text-sm text-white-600 hover:underline text-xs" href={`/quadras/${quadra.id}`}>
                                Reservar
                            </Link>
                        ) : (
                            <Link className="text-sm text-white-600 hover:underline text-xs" href="/auth/login">
                                Reservar
                            </Link>
                        )}
                    </Button>


                </div>
            </div>
        </Suspense>

    )
}
