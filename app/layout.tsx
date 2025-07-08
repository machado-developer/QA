'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { Filter } from 'lucide-react';
import { List } from 'phosphor-react';
import { motion } from 'framer-motion';
import { useSearchParams, usePathname } from 'next/navigation';
import { useMediaQuery } from 'react-responsive';

import goalImage from '@/app/assets/image/quadra-banner.webp';
import "@/app/globals.css";

import HeaderWithMenuNonAuth from '@/components/header-with-menu-non-auth';
import FiltroQuadras from '@/components/filtroQuadras';
import AuthProvider from '@/components/auth-provider';
import Loading from '@/loading';
import { formatCurrency } from '@/lib/utils';
import { esportesMenu } from './navmenu';
import './globals.css'
import { Toaster } from 'react-hot-toast'


export const dynamic = 'force-dynamic';

interface Quadra {
  id: string;
  name: string;
  pricePerHour: number;
  featuredImage: string;
}
export interface Categorias {
  id: string;
  name: string;
}

interface SearchParamsProps {
  render: (params: { categoriaAtual: string | null; pathname: string }) => React.ReactNode;
}

function SearchParamsWrapper({ render }: SearchParamsProps) {
  const searchParams = useSearchParams();
  const categoriaAtual = searchParams.get("category");
  const pathname = usePathname();

  return <>{render({ categoriaAtual, pathname })}</>;
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quadras, setQuadras] = useState<Quadra[]>([]);
  const [categories, setCategorias] = useState<Categorias[]>([]);
  const [showMobileFiltro, setShowMobileFiltro] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    const fetchQuadras = async () => {
      try {
        const response = await fetch(`/api/courts?limit=6`);
        const data = await response.json();
        setQuadras(data.courts || []);
      } catch (error) {
        console.error("Erro ao buscar quadras:", error);
      }
    };

    const fetchCategorias = async () => {
      try {
        const response = await fetch(`/api/admin/categories?limit=6`);
        const data = await response.json();
        setCategorias(data.categories || []);
      } catch (error) {
        console.error("Erro ao buscar quadras:", error);
      }
    };
    fetchCategorias()
    fetchQuadras();
  }, []);

  const destaques = useMemo(() => quadras.slice(0, 3), [quadras]);
  const recentes = useMemo(() => quadras.slice(3), [quadras]);

  return (
    <html lang="pt-BR">
      <Head>
        <title>Quadras Esportivas</title>
        <meta name="description" content="Encontre quadras esportivas ideais para suas partidas e conecte-se com atletas." />
      </Head>
      <body>
        <AuthProvider>
          <Suspense fallback={<Loading />}>
            <SearchParamsWrapper
              render={({ categoriaAtual, pathname }) => {
                const pathsToIgnore = ['/auth', '/admin', '/operador', '/perfil', '/sobre', '/contactos',"/unauthorized"];
                const hideLayout = pathsToIgnore.some(path => pathname.startsWith(path));

                if (hideLayout) return <>{children}</>;

                return (
                  <div className="min-h-screen flex flex-col w-full">
                    <HeaderWithMenuNonAuth categories={categories} />

                    {/* Banner */}
                    <div className="w-full h-80 bg-gray-300 flex items-center justify-center bg-cover relative" style={{ backgroundImage: `url(${goalImage.src})` }}>
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-white p-8">
                        <motion.h1
                          className="text-3xl md:text-5xl font-extrabold mb-4 text-center"
                          initial={{ opacity: 0, y: -50 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          A plataforma ideal para conectar <br /> atletas e quadras
                        </motion.h1>
                        <motion.p
                          className="text-base md:text-lg text-center"
                          initial={{ opacity: 0, y: -50 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          Encontre a quadra perfeita para suas partidas e conecte-se com outros atletas.
                        </motion.p>
                      </div>
                    </div>

                    {/* Menu horizontal */}
                    <div className="sticky top-[70px] z-10 bg-white shadow-md border-b">
                      <div className="flex justify-center items-center px-4 py-3 overflow-x-auto">
                        <nav className="flex space-x-6">
                          {esportesMenu.map(({ nome, slug, Icon }) => {
                            const ativo = slug === categoriaAtual;
                            return (
                              <Link
                                key={slug}
                                href={`/quadras?category=${slug}`}
                                className={`flex items-center space-x-2 p-2 text-xs font-medium rounded-md ${ativo
                                  ? "text-white bg-green-400 underline"
                                  : "text-gray-700 hover:bg-green-200"
                                  }`}
                              >
                                <Icon size={20} weight={ativo ? "fill" : "regular"} />
                                <span>{nome}</span>
                              </Link>
                            );
                          })}
                          <Link
                            href="/quadras"
                            className={`flex items-center space-x-2 font-medium ${categoriaAtual === null
                              ? "text-blue-700 font-bold underline"
                              : "text-gray-700 hover:text-blue-700"
                              }`}
                          >
                            <List size={20} weight={categoriaAtual === null ? "fill" : "regular"} />
                            <span>Todos</span>
                          </Link>
                        </nav>
                      </div>
                    </div>

                    {/* Conteúdo principal */}
                    <div className="flex justify-between mx-2 py-2 px-4 w-full">
                      {/* Filtros */}
                      <aside className="hidden md:block md:w-1/1">
                        <div className="sticky top-[130px] max-h-[calc(100vh-100px)] overflow-y-auto">
                          <FiltroQuadras />
                        </div>
                      </aside>

                      <main className="md:w-2/4 lg:w-1/2 xl:w-2/3 w-full bg-white p-2">
                        <div className="flex items-center space-x-4 bg-gray-100 p-4 w-full rounded-md mb-6">
                          {isMobile ? (
                            <button
                              className="flex w-full items-center bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-500"
                              onClick={() => setShowMobileFiltro(!showMobileFiltro)}
                            >
                              <Filter className="mr-1 w-4 h-4" /> Filtro Avançado
                            </button>
                          ) : (
                            <div className="text-gray-700 font-medium">
                              Encontre a melhor quadra para a sua equipe
                            </div>
                          )}
                        </div>

                        {isMobile && showMobileFiltro && (
                          <div className="fixed inset-0 z-50 bg-white p-4 overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                              <h2 className="text-xl font-semibold">Filtro Avançado</h2>
                              <button
                                className="text-red-500 font-bold text-lg"
                                onClick={() => setShowMobileFiltro(false)}
                              >
                                ✕
                              </button>
                            </div>
                            <FiltroQuadras />
                          </div>
                        )}

                        {children}
                      </main>

                      {/* Lateral direita */}
                      <aside className="hidden md:block md:w-1/5 lg:w-1/4">
                        <div className="sticky top-[80px] max-h-[calc(100vh-100px)] overflow-y-auto">
                          <h2 className="text-xs font-semibold mb-3">Destaques</h2>
                          <div className="space-y-3">
                            {destaques.map((q) => (
                              <div key={q.id} className="border p-2 rounded-lg shadow-sm">
                                <Link href={`/quadras/${q.id}`}>
                                  <Image src={q.featuredImage} width={150} height={100} alt="Quadra" className="rounded-md" />
                                  <p className="text-sm mt-2">
                                    {q.name} - {formatCurrency(q.pricePerHour)}/H
                                  </p>
                                </Link>
                              </div>
                            ))}
                          </div>

                          <h2 className="text-lg font-semibold mt-6 mb-3">Mais Recentes</h2>
                          <div className="space-y-3">
                            {recentes.map((q) => (
                              <div key={q.id} className="border p-2 rounded-lg shadow-sm">
                                <Link href={`/quadras/${q.id}`}>
                                  <Image src={q.featuredImage} width={150} height={100} alt="Quadra" className="rounded-md" />
                                  <p className="text-sm mt-2">
                                    {q.name} - {formatCurrency(q.pricePerHour)}/H
                                  </p>
                                </Link>
                              </div>
                            ))}
                          </div>
                        </div>
                      </aside>
                    </div>
                  </div>
                );
              }}
            />
          </Suspense>
        </AuthProvider>
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
};

export default Layout;
