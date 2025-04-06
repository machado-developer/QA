// components/StarRating.tsx
import { Star } from 'lucide-react'
import { useState } from 'react'

export default function StarRating({
    rating = 0,
    onRate,
}: {
    rating?: number
    onRate?: (rating: number) => void
}) {
    const [hovered, setHovered] = useState<number | null>(null)

    return (
        <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    className={`w-5 h-5 cursor-pointer transition-all ${(hovered ?? rating) >= i ? 'fill-yellow-400 stroke-yellow-400' : 'stroke-gray-400'
                        }`}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => onRate?.(i)}
                />
            ))}
        </div>
    )
}
