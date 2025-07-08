'use client';

import Image from 'next/image';
import { Suspense, useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import quadraPlaceholder from '@/app/assets/image/atletas.svg';
import QuadraCardList from '@/components/ui/quadraCardList';
import { useSearchParams } from 'next/navigation';
import Loading from '@/loading';

export const dynamic = 'force-dynamic'; // <== Impede que Next.js tente pré-renderizar

function FiltersWrapper({ quadras, setQuadrasFiltradas }: { quadras: any[], setQuadrasFiltradas: Function }) {
  const searchParams = useSearchParams();

  const removeAcentos = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  useEffect(() => {
    const nome = searchParams.get("name")?.toLowerCase() || "";
    const endereco = searchParams.get("address")?.toLowerCase() || "";
    const categorias = searchParams.get("category")?.toLowerCase().split(",") || [];
    const preco = parseFloat(searchParams.get("pricePerHour") || "");

    const filtradas = quadras.filter((quadra) => {
      const matchNome = nome
        ? removeAcentos(quadra.name?.toLowerCase() || "").includes(removeAcentos(nome))
        : true;

      const matchEndereco = endereco
        ? removeAcentos(quadra.address?.toLowerCase() || "").includes(removeAcentos(endereco))
        : true;

      const matchCategoria = categorias.length > 0 && categorias[0] !== ""
        ? categorias.some((cat: string) =>
          (quadra.category || []).some((qcat: string) =>
            removeAcentos(qcat?.toLowerCase() || "") === removeAcentos(cat.trim())
          )
        )
        : true;

      const matchPreco = !isNaN(preco)
        ? parseFloat(quadra.pricePerHour) <= preco
        : true;

      return matchNome && matchEndereco && matchCategoria && matchPreco;
    });

    setQuadrasFiltradas(filtradas);
  }, [searchParams, quadras]);

  return null;
}

export default function HomePage() {
  const [quadras, setQuadras] = useState<any[]>([]);
  const [quadrasFiltradas, setQuadrasFiltradas] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ name: string, id: string, courts?: any }[]>([]);

  useEffect(() => {
    fetchQuadras();
    fetchCategories();
  }, []);

  const fetchQuadras = async () => {
    try {
      const response = await fetch("/api/admin/courts");
      const data = await response.json();
      setQuadras(data.courts || []);
    } catch (error) {
      console.error("Erro ao buscar quadras:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  };

  return (
    <>
      <Suspense fallback={<Loading />}>
        <FiltersWrapper quadras={quadras} setQuadrasFiltradas={setQuadrasFiltradas} />
      </Suspense>

      <section className='w-full'>
        {categories?.map((categoria) => (
          <QuadraCardList
            key={categoria.name}
            categoria={categoria}
            quadras={quadras.filter((quadra) =>
              quadra.category.some((cat: { name: string }) => cat.name === categoria?.name)
            )}
          />
        ))}

        {quadras.length === 0 && (
          <div className="text-center">
            <p className="text-gray-500">Nenhuma quadra encontrada.</p>
          </div>
        )}
      </section>
    </>
  );
}
