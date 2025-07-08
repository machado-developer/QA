"use client";

import HeaderNonAuth from '@/components/header-non-auth';
import goalImage from '@/app/assets/image/goal.svg';
import { motion } from 'framer-motion';
import HeaderWithMenuNonAuth from '@/components/header-with-menu-non-auth';
import { Suspense } from 'react';
import Loading from '@/loading';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (

    <div className="flex flex-col min-h-screen">
      <Suspense fallback={<Loading></Loading>}>
        <HeaderWithMenuNonAuth />
      </Suspense>
      <section className="flex flex-wrap min-h-screen">
        {/* Conteúdo Dinâmico */}
        <Suspense fallback={<Loading></Loading>}>
          <div className="w-full md:w-1/2 flex items-center justify-center p-4">
            {children}
          </div>
        </Suspense>
        {/* Imagem de fundo e descrição */}
        <div className="w-full md:w-1/2 h-96 md:h-screen bg-no-repeat bg-contain bg-bottom relative" style={{ backgroundImage: `url(${goalImage.src})` }}>
          <div className="absolute inset-0 bg-green-500 bg-opacity-0 flex flex-col justify-bottom items-center text-green-300 text-top p-8">
            {/* <motion.h1 className="text-3xl md:text-5xl font-extrabold text-green-900 mb-4 text-center" initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              A plataforma ideal para conectar atletas e quadras
            </motion.h1>
            <motion.p className="text-base md:text-lg text-green-900 text-center" initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              Encontre a quadra perfeita para suas partidas e<br className="hidden md:block" /> conecte-se com outros atletas de forma fácil e rápida.
            </motion.p> */}
          </div>
        </div>
      </section>
    </div>

  );
}
