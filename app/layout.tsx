'use client';

import React, { ReactNode, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Filter } from 'lucide-react';
import "@/app/globals.css";
import goalImage from '@/app/assets/image/quadra-banner.webp';
import { motion } from 'framer-motion';
import HeaderWithMenuNonAuth from '@/components/header-with-menu-non-auth';
import { usePathname } from 'next/navigation';
import FiltroQuadras from '@/components/filtroQuadras';
import AuthProvider from '@/components/auth-provider';
import { useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { formatCurrency } from '@/lib/utils';


const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const pathsToIgnore = ['/auth', '/admin', "/perfil","/sobre","/contactos"];
  const hideLayout = pathsToIgnore.some(path => pathname.startsWith(path));
  const [showMobileFiltro, setShowMobileFiltro] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });


  const [quadras, setQuadras] = useState<{
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
    categories: { name: string };
    availabilities: { id: string; courtId: string; userId: string | null; startTime: string; date: string; period: string; endTime: string; createdAt: string; updatedAt: string; createdById: string; updatedById: string | null; }[];
  }[] | []>([]); // começa com null pra validar corretamente

  const [modalAberto, setModalAberto] = useState(false);
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

  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          {
            hideLayout ? (
              children
            ) : (
              <div className="min-h-screen flex flex-col w-full ">

                <HeaderWithMenuNonAuth />
                {/* Banner Central */}
              
                <div className="w-full h-80  bg-gray-300 flex items-center bg-center justify-centent bg-no-repeat bg-contain bg-cover relative" style={{ backgroundImage: `url(${goalImage.src})` }}>
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-white text-top p-8">

                    <motion.h1 className="text-3xl md:text-5xl font-extrabold mb-4 text-center" initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                      A plataforma ideal para conectar <br></br>atletas e quadras
                    </motion.h1>
                    <motion.p className="text-base md:text-lg text-center" initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                      Encontre a quadra perfeita para suas partidas e<br className="hidden md:block" /> conecte-se com outros atletas de forma fácil e rápida.
                    </motion.p>
                  </div>
                </div>

                {/* Menu Horizontal abaixo do Banner */}
                <div className="sticky top-[70px] max-h-[calc(100vh-100px)] z-10 overflow-y-auto">
                  <div className="bg-white shadow-md p-4 flex justify-center items-center space-x-4 border-b overflow-x-auto">

                    <nav className="flex space-x-6">
                      <Link href="/quadras?categoria=footebol" className="text-gray-700 hover:text-blue-700 font-medium flex items-center space-x-2">
                        <Search className="w-4 h-4" />
                        <span>Futebol</span>
                      </Link>
                      <Link href="/quadras?categoria=handebol" className="text-gray-700 hover:text-blue-700 font-medium flex items-center space-x-2">
                        <Filter className="w-4 h-4" />
                        <span>Handebol</span>
                      </Link>
                      <Link href="/quadras?categoria=basquete" className="text-gray-700 hover:text-blue-700 font-medium flex items-center space-x-2">
                        <Search className="w-4 h-4" />
                        <span>Basquete</span>
                      </Link>
                      <Link href="/quadras?categoria=Tênis" className="text-gray-700 hover:text-blue-700 font-medium flex items-center space-x-2">
                        <Filter className="w-4 h-4" />
                        <span>Tênis</span>
                      </Link>
                      <Link href="/quadras" className="text-gray-700 hover:text-blue-700 font-medium flex items-center space-x-2">
                        <Search className="w-4 h-4" />
                        <span>Todos</span>
                      </Link>
                    </nav>
                  </div>

                </div>


                <div className="flex  justify-between mx-2 py-2 px-4 md:px-8  m-0 w-full">
                  {/* Menu Lateral Esquerdo (Filtros) */}
                  <aside className="hidden md:block md:w-1/1">
                    <div className="sticky top-[130px] max-h-[calc(100vh-100px)] overflow-y-auto">
                      <FiltroQuadras />
                    </div>
                  </aside>

                  {/* Conteúdo Principal */}
                  <main className="w-full md:w-2/4 lg:w-1/2 xl:w-2/3  bg-gray-15 p-4">
                    <div className="flex items-center space-x-4 bg-gray-100 p-4 rounded-md mb-6">

                      {isMobile ? (
                        <button
                          className="flex w-full items-center bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-500"
                          onClick={() => setShowMobileFiltro(!showMobileFiltro)}
                        >
                          <Filter className="mr-1 w-4 h-4" /> Filtro Avançado
                        </button>
                      ) : (
                        <div className="text-gray-700 font-medium overflow-hidden whitespace-nowrap">
                          <div className="animate-scroll inline-block">
                            Encontre a melhor quadra para a sua equipe
                          </div>
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

                  {/* Menu Lateral Direito (Destaques e Recentes) */}
                  <aside className="hidden md:block md:w-1/5 lg:w-1/4">
                    <div className="sticky top-[80px] max-h-[calc(100vh-100px)] overflow-y-auto">
                      <h2 className="text-lg font-semibold mb-3">Destaques</h2>
                      <div className="space-y-3">
                        {quadras.map(q => (
                          <div key={q.id} className="border p-2 rounded-lg shadow-sm">
                           <Link href={`/quadras/${q.id}`}>
                              <Image src={q.featuredImage} width={150} height={100} alt="Quadra" className="rounded-md" />
                              <p className="text-sm mt-2">{q.name}- {formatCurrency(q.pricePerHour)}/H</p>
                            </Link>
                          </div>
                        ))}
                      </div>

                      <h2 className="text-lg font-semibold mt-6 mb-3">Mais Recentes</h2>
                      <div className="space-y-3">
                        {quadras.map(q => (
                          <div key={q.id} className="border p-2 rounded-lg shadow-sm">
                            <Link href={`/quadras/${q.id}`}>
                              <Image src={q.featuredImage} width={150} height={100} alt="Quadra" className="rounded-md" />
                              <p className="text-sm mt-2">{q.name}- {formatCurrency(q.pricePerHour)}/H</p>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  </aside>

                </div>

              </div>
            )
          }
        </AuthProvider>
      </body>
    </html >
  );
}

export default Layout;