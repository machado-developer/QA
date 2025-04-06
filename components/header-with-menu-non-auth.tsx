'use client'
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Linkedin, Menu, Twitter, User, X } from "lucide-react";
import logoImage from "@/app/assets/image/logo.png";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";

function HeaderWithMenuNonAuth() {
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [submenuOpen, setSubmenuOpen] = useState<{ [key: string]: boolean }>({});
    const { data: session, status } = useSession();
    const user = session?.user; // Mock user data
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
        document.body.style.overflow = isOpen ? "auto" : "hidden";
    };

    const toggleSubmenu = (name: string) => {
        setSubmenuOpen(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const menu = [
        { name: "Início", link: "/" },
        { name: "Sobre", link: "/about" },
        { name: "Categorias", link: "/categorias?type=all", children: [{ name: "Quadras", link: "/services" }, { name: "Eventos", link: "/events" }] },
        { name: "Contato", link: "/contact", children: [{ name: "Fale Conosco", link: "/contact" }] },
    ];
    const socialIcons = [
        { name: "Facebook", icon: <Facebook className={`${scrolled ? "text-white" : "text-gray-700"} hover:text-blue-600 text-lg`} /> },
        { name: "Twitter", icon: <Twitter className={`${scrolled ? "text-white" : "text-gray-700"} hover:text-blue-400 text-lg`} /> },
        { name: "Instagram", icon: <Instagram className={`${scrolled ? "text-white" : "text-gray-700"} hover:text-pink-500 text-lg`} /> },
        { name: "Linkedin", icon: <Linkedin className={`${scrolled ? "text-white" : "text-gray-700"} hover:text-blue-700 text-lg`} /> },
    ];


    return (
        <header className={`fixed w-full top-0 z-50 shadow-xs transition-all duration-300 py-4 ${scrolled ? "bg-green-900 shadow-md" : "bg-white"}`}>
            <div className="container mx-auto flex justify-between items-center px-4 md:px-8">

                {/* Logo */}
                <Link href="/" className="text-2xl font-bold flex items-center">
                    <Image src={logoImage} alt="Logo" className="w-20 h-10" />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden text-sm font-light md:flex space-x-6">
                    {menu.map((item) => (
                        <div key={item.name} className="relative group">
                            <Link href={item.link} className={`${scrolled ? "text-white" : "text-gray-700"} hover:text-green-500 px-3 py-2 transition`}>
                                {item.name} {item.children && <span className="ml-1 text-gray-400">▼</span>}
                            </Link>

                            {item.children && (
                                <div className="absolute left-0 mt-2 hidden group-hover:flex flex-col bg-white shadow-md rounded-lg border border-gray-200 w-48 opacity-0 group-hover:opacity-100 transform scale-y-0 group-hover:scale-y-100 origin-top transition-all duration-300">
                                    <ul className="py-2">
                                        {item.children.map((child) => (
                                            <li key={child.name}>
                                                <Link href={child.link} className="block px-4 py-2 text-gray-700 hover:text-green-500 hover:bg-gray-100 transition">
                                                    {child.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                {/* CTA + Ícones Sociais */}
                <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
                    <Link href="/quadras">
                        <button className="border text-sm font-light text-white bg-green-700 px-4 py-2 rounded-md hover:bg-green-600 transition">
                            Agende agora!
                        </button>
                    </Link>

                    <div className="hidden md:flex space-x-3">
                        {socialIcons.map((icon) => (
                            <a key={icon.name} href="#" className="text-gray-700 hover:text-green-500 transition">
                                {icon.icon}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Usuário */}
                {user?.name ? (
                    <div className="relative group">
                        <button className="flex items-center space-x-2 p-2 border rounded-full hover:bg-gray-100 transition">
                            <User className={`${scrolled ? "text-white" : "text-gray-700"} text-xl`} />
                            <span className={`${scrolled ? "text-white" : "text-gray-700"} hidden md:block text-gray-700 font-medium`}>Minha Conta</span>
                        </button>
                        <div className="absolute right-0 mt-0 hidden group-hover:block bg-white shadow-md rounded-lg border border-gray-200 w-48 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <ul className="py-2">
                                <li><Link href="/perfil" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Perfil</Link></li>
                                <li><button className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100" onClick={async () => await signOut()}>Sair</button></li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <Link href="/auth/login">
                        <button className="flex items-center space-x-2 p-2 border rounded-full hover:bg-gray-100 transition">
                            <User className={`${scrolled ? "text-white" : "text-gray-700"} text-xl`} />
                            <span className={`${scrolled ? "text-white" : "text-gray-700"} hidden md:block text-gray-700 font-medium`}>Entrar</span>
                        </button>
                    </Link>
                )}

                {/* Mobile Menu Button */}
                <button className="md:hidden" onClick={toggleMenu} aria-expanded={isOpen}>
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-white shadow-lg py-6 px-6">
                    <nav className="flex flex-col space-y-4">
                        {menu.map((item) => (
                            <div key={item.name}>
                                <button onClick={() => item.children && toggleSubmenu(item.name)} className="text-gray-700 hover:text-green-500 transition w-full text-left">
                                    {item.name} {item.children && <span className="ml-1 text-gray-400">{submenuOpen[item.name] ? "▲" : "▼"}</span>}
                                </button>

                                {item.children && submenuOpen[item.name] && (
                                    <div className="pl-4 mt-2 flex flex-col space-y-2">
                                        {item.children.map((child) => (
                                            <Link key={child.name} href={child.link} className="text-gray-600 hover:text-green-500 transition">
                                                {child.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>

                    <div className="mt-4">
                        <Button className="w-full bg-green-600 text-white hover:bg-green-700">
                            <Link href="/quadras">Agendar</Link>
                        </Button>
                    </div>
                </div>
            )}
        </header>
    );
};

export default HeaderWithMenuNonAuth;
