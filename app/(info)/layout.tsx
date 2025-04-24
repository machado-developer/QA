'use client';

import { ReactNode, useState, useEffect } from 'react';

import HeaderNonAuth from '@/components/header-non-auth';
import HeaderWithMenuNonAuth from '@/components/header-with-menu-non-auth';
import Image from 'next/image';
import { motion } from 'framer-motion';
import goalImage from '@/app/assets/image/quadra-banner.webp';
export default function AboutLayout({ children }: { children: ReactNode }) {


    return (

        <div className="min-h-screen flex flex-col mx-auto">
            {/* Header */}
            <HeaderWithMenuNonAuth />
            <div className="w-full h-80  bg-gray-300 flex items-center bg-center justify-centent bg-no-repeat bg-contain bg-cover relative" style={{ backgroundImage: `url(${goalImage.src})` }}>
                <div className="absolute w-full inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-white text-top ">

                    <motion.h1 className="text-3xl md:text-5xl font-extrabold mb-4 text-center" initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                       Sobre nós

                    </motion.h1>
                    <motion.p className="text-base md:text-lg text-center" initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                        O melhor lugar para reservar quadras esportivas online.
                    </motion.p>
                </div>
            </div>


            {/* Conteúdo Principal */}
            <main className="w-full mt-4 bg-gray-50 p-4 ">
                {children}
            </main>
            <footer className="w-full text-center text-gray-600 mt-8">
                <p>&copy; 2023 Agendamento de Quadras. Todos os direitos reservados.</p>
            </footer>

        </div>

    );
}
