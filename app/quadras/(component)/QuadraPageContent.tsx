// components/QuadraPageContent.tsx
"use client";

import { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import QuadraCardList from "@/components/ui/quadraCardList";
import { Quadra } from "@/types/quadra";
import Loading from "@/loading";

type Categoria = { name: string; id: string; courts?: any };


export default function QuadraPageContent() {
  const searchParams = useSearchParams();
  const [quadras, setQuadras] = useState<Quadra[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);

  const removeAcentos = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const fetchQuadras = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/courts");
      const data = await response.json();
      setQuadras(data.courts || []);
    } catch (error) {
      console.error("Erro ao buscar quadras:", error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  }, []);


  useEffect(() => {
    fetchQuadras();
    fetchCategories();
  }, [fetchQuadras, fetchCategories]);

  const filtradas = useMemo(() => {
    const nomeFiltro = removeAcentos(searchParams.get("name")?.toLowerCase() || "");
    const enderecoFiltro = removeAcentos(searchParams.get("address")?.toLowerCase() || "");
    const categoriasFiltro = (searchParams.get("category") || "")
      .toLowerCase()
      .split(",")
      .map(removeAcentos)
      .filter(Boolean);
    const precoFiltro = parseFloat(searchParams.get("pricePerHour") || "");

    return quadras.filter((quadra) => {
      const nomeQuadra = removeAcentos(quadra.name?.toLowerCase() || "");
      const enderecoQuadra = removeAcentos(quadra.address?.toLowerCase() || "");
      const categoriasQuadra = quadra.category?.map(c => removeAcentos(c.name.toLowerCase())) || [];
      const precoQuadra = parseFloat(quadra.pricePerHour.toString());

      const matchNome = !nomeFiltro || nomeQuadra.includes(nomeFiltro);
      const matchEndereco = !enderecoFiltro || enderecoQuadra.includes(enderecoFiltro);
      const matchCategoria = categoriasFiltro.length === 0 || categoriasFiltro.some(cat => categoriasQuadra.includes(cat));
      const matchPreco = isNaN(precoFiltro) || precoQuadra <= precoFiltro;

      return matchNome && matchEndereco && matchCategoria && matchPreco;
    });
  }, [quadras, searchParams]);

  return (
    <Suspense fallback={<Loading></Loading>}>
      <section className="w-full ">
        {categories.map((categoria) => {
          const quadrasCategoria = filtradas.filter((q) =>
            removeAcentos(q?.category?.[0]?.name?.toLowerCase() || "") === removeAcentos(categoria.name.toLowerCase())
          );

          return quadrasCategoria.length > 0 ? (
            <QuadraCardList key={categoria.name} categoria={categoria} quadras={quadrasCategoria} />
          ) : null;
        })}

        {filtradas.length === 0 && (
          <div className="text-center">
            <p className="text-gray-500">Nenhuma quadra encontrada com os filtros aplicados.</p>
          </div>
        )}
      </section>
    </Suspense>
  )
}
