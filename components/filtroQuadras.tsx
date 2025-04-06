'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FiltroQuadras() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [nome, setNome] = useState(searchParams.get('nome') || '');
  const [endereco, setEndereco] = useState(searchParams.get('endereco') || '');
  const [categoria, setCategoria] = useState(searchParams.get('categoria') || '');
  const [preco, setPreco] = useState(searchParams.get('preco') || '');
  const [data, setData] = useState(searchParams.get('data') || '');

  const atualizarFiltro = () => {
    const params = new URLSearchParams();

    if (nome) params.set('nome', nome);
    if (endereco) params.set('endereco', endereco);
    if (categoria) params.set('categoria', categoria);
    if (preco) params.set('preco', preco);
    if (data) params.set('data', data);

    router.push(`quadras?${params.toString()}`);
  };

  const limparFiltros = () => {
    setNome('');
    setEndereco('');
    setCategoria('');
    setPreco('');
    setData('');
    router.push('quadras'); // Remove todos os filtros da URL
  };

  return (
    <div className="w-full flex flex-col gap-4 p-4 bg-white shadow-md rounded-lg">
      <input
      type="text"
      placeholder="Nome da quadra"
      className="border p-2 rounded w-full"
      value={nome}
      onChange={(e) => setNome(e.target.value)}
      />
      <input
      type="text"
      placeholder="Endereço"
      className="border p-2 rounded w-full"
      value={endereco}
      onChange={(e) => setEndereco(e.target.value)}
      />
      <input
      type="text"
      placeholder="Categoria (ex: Futebol)"
      className="border p-2 rounded w-full"
      value={categoria}
      onChange={(e) => setCategoria(e.target.value)}
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
  );
}
