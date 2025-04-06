'use client';

import { ReactNode, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Filter, LucideHome, PlaySquare, User, WatchIcon, Menu } from 'lucide-react';
import HeaderWithMenuNonAuth from '@/components/header-with-menu-non-auth';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function PerfilLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const pathsToIgnore = ['/auth', '/admin'];
  const hideLayout = pathsToIgnore.some(path => pathname.startsWith(path));

  const toggleMenu = () => setMenuOpen(prev => !prev);

  return (
    
        <div className="min-h-screen flex flex-col Max-w-screen-2xl mx-auto">
          {/* Header */}
          <HeaderWithMenuNonAuth />


          {/* Botão mobile para abrir menu */}
          {/* <div className="md:hidden px-4 py-2">
            <button
              onClick={toggleMenu}
              className="flex items-center space-x-2 text-white   px-4 py-2 rounded-lg"
            >
              <Menu className='text-gray-400' />
              <span>Menu</span>
            </button>
          </div> */}

          {/* Sidebar Mobile - Overlay */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                className="fixed inset-0 bg-black/70 z-50 flex"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={toggleMenu}
              >
                <motion.div
                  className="bg-white w-64 h-full p-4 space-y-6"
                  initial={{ x: -300 }}
                  animate={{ x: 0 }}
                  exit={{ x: -300 }}
                  onClick={e => e.stopPropagation()}
                >
                  {/* Menu lateral esquerdo (Filtros) */}
                  <nav className="space-y-4 text-black">
                    <Link href="/perfil/dash" onClick={toggleMenu} className="block font-medium hover:text-blue-500 flex items-center space-x-2">
                      <LucideHome />
                      <span>Início</span>
                    </Link>
                    <Link href="/perfil/reservas" onClick={toggleMenu} className="block font-medium hover:text-green-500 flex items-center space-x-2">
                      <WatchIcon />
                      <span>Reservas</span>
                    </Link>
                    <Link href="/perfil" onClick={toggleMenu} className="block font-medium hover:text-green-500 flex items-center space-x-2">
                      <User />
                      <span>Perfil</span>
                    </Link>
                  </nav>

                  {/* Destaques e Recentes */}
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Destaques</h2>
                    {[1, 2, 3].map(id => (
                      <div key={id} className="border p-2 rounded-lg shadow-sm mb-2">
                        <Image src="/quadra.jpg" width={150} height={100} alt="Quadra" className="rounded-md" />
                        <p className="text-sm mt-2">Quadra Premium - R$ 100/h</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-1 mt-4 md:mt-12 container mx-auto py-6 px-4 md:px-8 space-x-0 md:space-x-4 w-full">
            {/* Sidebar Esquerda (Desktop) */}
            <aside className="hidden md:block md:w-1/4  p-4 rounded-lg bg-white shadow-sm">
              <div className="sticky top-[80px] max-h-[calc(100vh-100px)] overflow-y-auto">
                <nav className="space-y-4 text-black">
                  <Link href="/perfil/dash" className="block text-lg font-medium hover:text-blue-500 flex items-center space-x-2">
                    <LucideHome />
                    <span>Início</span>
                  </Link>
                  <Link href="/perfil/reservas" className="block text-lg font-medium hover:text-green-500 flex items-center space-x-2">
                    <WatchIcon />
                    <span>Reservas</span>
                  </Link>
                  <Link href="/perfil" className="block text-lg font-medium hover:text-green-500 flex items-center space-x-2">
                    <User />
                    <span>Perfil</span>
                  </Link>
                </nav>
              </div>
            </aside>

            {/* Conteúdo Principal */}
            <main className="w-full md:w-2/4 lg:w-1/2 xl:w-2/3 mt-4 md:mt-6 bg-gray-50 p-4 ">

              {/* Menu Horizontal Mobile */}
              <div className="md:hidden bg-white mt-12 shadow-sm sticky top-12 z-10">
                <nav className="flex justify-around items-center py-2 border-b">
                  <Link href="/perfil/dash" className="flex flex-col items-center text-sm text-gray-700 hover:text-blue-500">
                    <LucideHome size={20} />
                    <span>Início</span>
                  </Link>
                  <Link href="/perfil/reservas" className="flex flex-col items-center text-sm text-gray-700 hover:text-green-500">
                    <WatchIcon size={20} />
                    <span>Reservas</span>
                  </Link>
                  <Link href="/perfil" className="flex flex-col items-center text-sm text-gray-700 hover:text-green-500">
                    <User size={20} />
                    <span>Perfil</span>
                  </Link>
                </nav>
              </div>
              {children}
            </main>

            {/* Sidebar Direita (Desktop) */}
            <aside className="hidden md:block md:w-1/5 lg:w-1/4">
              <div className="sticky top-[80px] max-h-[calc(100vh-100px)] overflow-y-auto">
                <h2 className="text-lg font-semibold mb-3">Destaques</h2>
                <div className="space-y-3">
                  {[1, 2, 3].map(id => (
                    <div key={id} className="border p-2 rounded-lg shadow-sm">
                      <Image src="/quadra.jpg" width={150} height={100} alt="Quadra" className="rounded-md" />
                      <p className="text-sm mt-2">Quadra Premium - R$ 100/h</p>
                    </div>
                  ))}
                </div>

                <h2 className="text-lg font-semibold mt-6 mb-3">Mais Recentes</h2>
                <div className="space-y-3">
                  {[4, 5, 6].map(id => (
                    <div key={id} className="border p-2 rounded-lg shadow-sm">
                      <Image src="/quadra.jpg" width={150} height={100} alt="Quadra" className="rounded-md" />
                      <p className="text-sm mt-2">Nova Quadra - R$ 80/h</p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
  
  );
}
