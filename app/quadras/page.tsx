'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import quadraPlaceholder from '@/app/assets/image/atletas.svg';
import QuadraCardList from '@/components/ui/quadraCardList';

const mockData = [
  {
    id: "1",
    name: 'Quadra Society A',
    price: '100',
    category: 'Futebol',
    image: quadraPlaceholder,
    address: 'Rua Futebol, 123',
  },
  {
    id: "2",
    name: 'Quadra de Tênis B',
    price: '80',
    category: 'Tênis',
    image: quadraPlaceholder,
    address: 'Rua Tênis, 456',
  },
  {
    id: "3",
    name: 'Quadra de Basquete C',
    price: '120',
    category: 'Basquete',
    image: quadraPlaceholder,
    address: 'Rua Basquete, 789',
  },
  {
    id: "4",
    name: 'Quadra Society D',
    price: '105',
    category: 'Futebol',
    image: quadraPlaceholder,
    address: 'Rua Futebol, 123',

  },
  {
    id: "9",
    name: 'Quadra Society D',
    price: 'R$ 105/h',
    category: 'Futebol',
    image: quadraPlaceholder,
    address: 'Rua Futebol, 123',
  },
  {
    id: "10",
    name: 'Quadra Society D',
    price: 'R$ 105/h',
    category: 'Futebol',
    image: quadraPlaceholder,
    address: 'Rua Futebol, 123',
  },
  {
    id: "5",
    name: 'Quadra Society D',
    price: 'R$ 105/h',
    category: 'Futebol',
    image: quadraPlaceholder,
    address: 'Rua Futebol, 123',
  },
  {
    id: "6",
    name: 'Quadra Society D',
    price: 'R$ 105/h',
    category: 'Futebol',
    image: quadraPlaceholder,
    address: 'Rua Futebol, 123',
  },
];

export default function QuadraPage() {
  const searchParams = useSearchParams();
  const [quadras, setQuadras] = useState(mockData);

  useEffect(() => {
    const nome = searchParams.get('nome')?.toLowerCase();
    const endereco = searchParams.get('endereco')?.toLowerCase();
    const categoria = searchParams.get('categoria')?.toLowerCase();
    const preco = searchParams.get('preco'); // Valor numérico esperado
    const data = searchParams.get('data'); // Só como referência, não aplicado no mock

    const removeAcentos = (str: string) =>
      str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const filtradas = mockData.filter((quadra) => {
      const matchNome = nome ? removeAcentos(quadra.name.toLowerCase()).includes(removeAcentos(nome)) : true;
      const matchEndereco = endereco ? removeAcentos(quadra.address.toLowerCase()).includes(removeAcentos(endereco)) : true;
      const matchCategoria = categoria ? removeAcentos(quadra.category.toLowerCase()) === removeAcentos(categoria) : true;
      const matchPreco = preco ? parseFloat(quadra.price) <= parseFloat(preco) : true;

      return matchNome && matchEndereco && matchCategoria && matchPreco;
    });

    setQuadras(filtradas);
  }, [searchParams]);

  return (
    <main className="px-4 sm:px-6 lg:px-12 py-8">
      {/* Listagem de quadras */}
      <section>
        {['Futebol', 'Tênis', 'Basquete'].map((categoria) => {
          const quadrasCategoria = quadras.filter((q) => q.category === categoria);
          return quadrasCategoria.length > 0 ? (
            <QuadraCardList key={categoria} categoria={categoria} quadras={quadrasCategoria} />
          ) : null;
        })}

        {quadras.length === 0 && (
          <div className="text-center">
            <p className="text-gray-500">Nenhuma quadra encontrada com os filtros aplicados.</p>
          </div>
        )}
      </section>
    </main>
  );
}
