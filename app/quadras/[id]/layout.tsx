// app/quadras/[id]/layout.tsx
import QuadraCardList from '@/components/ui/quadraCardList'
import { ReactNode } from 'react'

export default function QuadraLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen rounded-8 bg-gray-100 px-4 py-6">
            <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-6">
                {children}
            </div>
       
        </div>
    )
}
