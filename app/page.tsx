'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import quadraPlaceholder from '@/app/assets/image/atletas.svg';
import QuadraCardList from '@/components/ui/quadraCardList';

const mockData = [
  {
    id: "1",
    name: 'Quadra Society A',
    price: 'R$ 100/h',
    category: 'Futebol',
    image: quadraPlaceholder,
    address: 'Rua Futebol, 123',
  },
  {
    id: "2",
    name: 'Quadra de Tênis B',
    price: 'R$ 80/h',
    category: 'Tênis',
    image: quadraPlaceholder,
    address: 'Rua Tênis, 456',
  },
  {
    id: "3",
    name: 'Quadra de Basquete C',
    price: 'R$ 120/h',
    category: 'Basquete',
    image: quadraPlaceholder,
    address: 'Rua Basquete, 789',

  },
  {
    id: "4",
    name: 'Quadra de Basquete A',
    price: 'R$ 120/h',
    category: 'Basquete',
    image: quadraPlaceholder,
    address: 'Rua Basquete, 789',

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
  {
    id: "7",
    name: 'Quadra Society D',
    price: 'R$ 105/h',
    category: 'Futebol',
    image: quadraPlaceholder,
    address: 'Rua Futebol, 123',
  },
  {
    id: "8",
    name: 'Quadra Society D',
    price: 'R$ 105/h',
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
  // Adicione mais quadras conforme necessário
];

export default function HomePage() {
  const [quadras, setQuadras] = useState(mockData);

  useEffect(() => {
    // Aqui você pode buscar dados reais da API
  }, []);

  return (
    <main className="px-4 sm:px-6 lg:px-12 py-8 w-full">
      

      {/* Listagem de quadras */}
      <section>
        {['Futebol', 'Tênis', 'Basquete'].map((categoria) => (
          <QuadraCardList key={categoria} categoria={categoria} quadras={quadras.filter(quadra => quadra.category === categoria)} />
        ))}
        {quadras.length === 0 && (
          <div className="text-center">
            <p className="text-gray-500">Nenhuma quadra encontrada.</p>
          </div>
        )}
      </section>
    </main>
  );
}
