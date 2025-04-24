"use client"
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import logoImage from '@/app/assets/image/logo.png';
function HeaderNonAuth() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleScroll = () => {
                if (window.scrollY > 50) {
                    setScrolled(true);
                } else {
                    setScrolled(false);
                }
            };

            window.addEventListener('scroll', handleScroll);
            return () => {
                window.removeEventListener('scroll', handleScroll);
            };
        }
    }, []);

    return (
        <header className={`fixed w-full border-1  top-0 z-50 transition-colors duration-300 ${scrolled ? 'bg-white shadow' : 'bg-transparent'}    py-2`}>
            <div className="container mx-auto flex justify-between items-center">
                <div className="logo flex mx-auto">
                    <Link href="/" className={` text-2xl font-bold text-gray-100 ${scrolled && "text-green-400"}`}> <Image src={logoImage} alt="Logo" className="w-20 h-10 mx-auto mb-4" /></Link>
                </div>
                <nav className="nav">
                    <ul className="flex space-x-5 justify-center w-full">


                        {/* <li>

                            <Button
                                size="lg"
                                className="bg-[#E9960A] text-black-900 hover:bg-orange-500"
                                asChild
                            >
                                <Link href="/register">Comece Agora</Link>
                            </Button>

                        </li> */}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default HeaderNonAuth;
