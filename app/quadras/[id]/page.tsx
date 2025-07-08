'use client'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import StarRating from '@/components/ui/starRating'
import ReservaModal from '@/components/reservaModal'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import QuadraCardList from '@/components/ui/quadraCardList'
import { Title } from '@radix-ui/react-toast'
import Loading from '@/loading'

export default function QuadraPage() {
    const { id } = useParams() as { id: string };


    const [quadras, setQuadras] = useState<{
        id: string;
        name: string;
        address: string;
        city: string;
        description: string;
        pricePerHour: number;
        featuredImage: string;
        rating: number,
        createdAt: string;
        updatedAt: string;
        userId: string | null;
        createdById: string;
        courtImages: { id: string; courtId: string; userId: string | null; url: string; createdAt: string; }[];
        category?: {
            id: string,
            name: string
        }[];
        availabilities: { id: string; courtId: string; userId: string | null; startTime: string; date: string; period: string; endTime: string; createdAt: string; updatedAt: string; createdById: string; updatedById: string | null; }[];
    }[] | []>([]); // começa com null pra validar corretamente

    const fetchQuadras = async () => {
        try {
            const response = await fetch(`/api/admin/courts?limit=5`);
            const data = await response.json();

            setQuadras(data.courts || null);
        } catch (error) {
            console.error("Erro ao buscar quadras:", error);
        }
    };
    
    useEffect(() => {
        fetchQuadras()
    }, []);

    const [quadra, setQuadra] = useState<{
        id: string;
        name: string;
        address: string;
        city: string;
        description: string;
        pricePerHour: number;
        featuredImage: string;
        createdAt: string;
        updatedAt: string;
        userId: string | null;
        createdById: string;
        courtImages: { id: string; courtId: string; userId: string | null; url: string; createdAt: string; }[];
        category?: {
            id: string,
            name: string
        }[];
        availabilities: { id: string; courtId: string; userId: string | null; startTime: string; date: string; period: string; endTime: string; createdAt: string; updatedAt: string; createdById: string; updatedById: string | null; }[];
    } | null>(null); // começa com null pra validar corretamente
    const [categories, setCategories] = useState<{ name: string, id: string, courts?: any }[]>([]);
    const [loading, setLoading] = useState(false)

    const [modalAberto, setModalAberto] = useState(false);
    const fetchQuadra = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/admin/courts/${id}`);
            const data = await response.json();

            console.log("DATA COURTS", data);
            setQuadra(data.court || null);
            setLoading(false)
        } catch (error) {
            console.error("Erro ao buscar quadras:", error);
            setLoading(false)
        }
    };
    useEffect(() => {
        fetchQuadras()
    }, [id]);
    useEffect(() => {
        fetchQuadra()
        setLoading(false)
    }, [id]);
    if (loading) return <Loading></Loading>

    useEffect(() => {
        fetchCategories()
    }, [id]);
    const fetchCategories = async () => {
        try {
            const response = await fetch("/api/admin/categories");
            const data = await response.json();
            setCategories(data.category || []);
        } catch (error) {
            console.error("Erro ao buscar categorias:", error);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-green-800">{quadra?.name}</h1>
            {quadra?.featuredImage && (
                <Image
                    src={quadra?.featuredImage}
                    alt={quadra?.name || "imagem da quadra"}
                    width={1000}
                    height={400}
                    className="w-full rounded-lg object-cover max-h-[400px]"
                />
            )}
            <h1>imagens da quadra</h1>
            {(quadra?.courtImages ?? []).length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {quadra?.courtImages.map((image) => (
                        <Image
                            key={image.id}
                            src={image.url}
                            alt={`Imagem da quadra ${quadra?.name}`}
                            width={300}
                            height={200}
                            className="w-full h-auto rounded-lg object-cover"
                        />
                    ))}
                </div>
            )}
            <hr></hr>
            <div className="flex flex-col gap-2 text-gray-700">
                <p className="text-lg font-semibold text-red-600">{quadra?.pricePerHour}</p>
                <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    {quadra?.address}
                </p>
                <p className="flex items-center gap-2">
                    <span className="bg-green-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                        {quadra?.category?.map(cat => cat.name)}
                    </span>
                </p>
                <p className="text-sm">{quadra?.description}</p>
            </div>
            <div className="pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-1">Avaliações:</p>
                <StarRating rating={0} />
            </div>

            <div className="pt-6">
                <button onClick={() => setModalAberto(true)} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-500 transition duration-200">
                    Reservar agora
                </button>
            </div>

            <ReservaModal
                isOpen={modalAberto}
                onClose={() => setModalAberto(false)}
                quadraId={quadra?.id ?? ''}
                quadraNome={quadra?.name ?? ''}
            />
        </div>
    );
}
