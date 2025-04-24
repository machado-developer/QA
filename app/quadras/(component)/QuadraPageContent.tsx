// components/QuadraPageContent.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import QuadraCardList from "@/components/ui/quadraCardList";

export default function QuadraPageContent() {
  const searchParams = useSearchParams();
  const [quadras, setQuadras] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ name: string, id: string, courts?: any }[]>([]);

  const removeAcentos = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  useEffect(() => {
    fetchQuadras();
    fetchCategories();
  }, []);

  const filtradas = quadras.filter((quadra) => {
    const nome = searchParams.get("name")?.toLowerCase() || "";
    const endereco = searchParams.get("address")?.toLowerCase() || "";
    const categorias = searchParams.get("category")?.toLowerCase().split(",") || [];
    const preco = parseFloat(searchParams.get("pricePerHour") || "");

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
    <main className="px-4 sm:px-6 lg:px-12 py-8">
      <section>
        {categories.map((categoria) => {
          const quadrasCategoria = filtradas.filter((q) => q.category[0]?.name === categoria.name);
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
    </main>
  );
}
