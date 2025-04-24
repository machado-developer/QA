'use client';

import Loading from '@/loading';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

export default function FiltroQuadras() {
  const router = useRouter();
  const searchParams =useSearchParams()

  const [name, setName] = useState(searchParams.get('name') || '');
  const [address, setAddress] = useState(searchParams.get('address') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [preco, setPreco] = useState(searchParams.get('preco') || '');
  const [data, setData] = useState(searchParams.get('data') || '');

  const atualizarFiltro = () => {
    const params = new URLSearchParams();

    if (name) params.set('name', name);
    if (address) params.set('address', address);
    if (category) params.set('category', category);
    if (preco) params.set('pricePerHour', preco);
    if (data) params.set('data', data);

    router.push(`quadras?${params.toString()}`);
  };

  const limparFiltros = () => {
    setName('');
    setAddress('');
    setCategory('');
    setPreco('');
    setData('');
    router.push('quadras'); // Remove todos os filtros da URL
  };

  return (
   <Suspense fallback={<Loading></Loading>}>
     <div className="w-full flex flex-col gap-4 p-4 bg-white shadow-md rounded-lg">
      <input
        type="text"
        placeholder="Nome da quadra"
        className="border p-2 rounded w-full"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Endereço"
        className="border p-2 rounded w-full"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <input
        type="text"
        placeholder="Categoria (ex: Futebol)"
        className="border p-2 rounded w-full"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <input
        type="number"
        placeholder="Preço máximo"
        className="border p-2 rounded w-full"
        value={preco}
        onChange={(e) => setPreco(e.target.value)}
      />
      <input
        type="date"
        className="border p-2 rounded w-full"
        value={data}
        onChange={(e) => setData(e.target.value)}
      />

      <div className="flex flex-col gap-2">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
          onClick={atualizarFiltro}
        >
          Aplicar Filtros
        </button>
        <button
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 w-full"
          onClick={limparFiltros}
        >
          Limpar Filtros
        </button>
      </div>
    </div>
   </Suspense>
  );
}
