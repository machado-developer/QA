'use client'
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { Menu, X } from "lucide-react";
import Loading from "@/loading";
import { adminMenu } from "../navmenu";
import Image from "next/image";
import logo from '@/app/assets/image/logo.png';

const Skeleton = () => (
    <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-300 rounded w-3/4"></div>
        <div className="h-6 bg-gray-300 rounded w-2/4"></div>
        <div className="h-6 bg-gray-300 rounded w-5/6"></div>
    </div>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: session, status } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (status === "loading") {
        return <Loading />;
    }

    const role = session?.user?.role;
    const username = session?.user?.name;


    return (
        <div className="flex min-h-screen">
            {/* Sidebar fixa no desktop, responsiva no mobile */}
            <Sidebar role={role} menuItems={adminMenu} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="flex flex-col flex-1 md:ml-64">
                <Header username={username} setSidebarOpen={setSidebarOpen} />
                <main className="flex-1 p-6 mt-8 overflow-auto pb-16">{status === "authenticated" ? children : <Skeleton />}</main>
                <Footer role={role} />
            </div>
        </div>
    );
};

const Sidebar: React.FC<{ role: string | null | undefined, menuItems: any[], sidebarOpen: boolean, setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>> }> = ({ role, menuItems, sidebarOpen, setSidebarOpen }) => {
    const pathname = usePathname();

    return (
        <>
            {/* Sidebar fixa no desktop */}
            <aside className="fixed top-0 left-0 w-50 h-screen p-4 bg-black text-white shadow-lg hidden md:block z-50 overflow-y-auto">
                <div className="flex items-center justify-center mb-6">
                    <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center">
                        <Image src={logo} alt="Logo" width={40} height={40} className="h-12 w-auto" />
                    </div>
                </div>
                <div className="flex items-center rounded-lg justify-between mb-6 bg-white">
                    <h2 className="text-xl text-black p-4 font-bold">{role === "ADMINISTRADOR" ? "Admin Panel" : "User Panel"}</h2>
                </div>

                <nav className="mt-4 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.link;
                        return (
                            <Link
                                key={item.name}
                                href={item.link}
                                className={`flex items-center p-2 rounded-lg transition ${isActive
                                    ? "bg-white text-gray-900 font-bold"
                                    : "hover:bg-gray-400 hover:text-gray-800"
                                    }`}
                            >
                                {React.createElement(item.icon, { className: "w-5 h-5 mr-2" })}
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Sidebar no mobile */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden overflow-y-auto" onClick={() => setSidebarOpen(false)}></div>
            )}
            <aside className={`fixed top-0 left-0 w-64 h-screen p-4 bg-black text-white shadow-lg z-50 transition-transform md:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <button className="absolute top-4 right-4 text-white" onClick={() => setSidebarOpen(false)}>
                    <X size={24} />
                </button>
                <div className="flex items-center justify-center mb-6">
                    <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center">
                        <Image src={logo} alt="Logo" width={40} height={40} className="h-12 w-auto" />
                    </div>
                </div>
                <div className="flex items-center rounded-lg justify-between mb-6 bg-white"  >
                    <h2 className="text-xl text-black p-4 font-bold">{role === "ADMINISTRADOR" ? "Admin Panel" : "User Panel"}</h2>
                </div>

                <nav className="mt-4 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.link;
                        return (
                            <Link
                                key={item.name}
                                href={item.link}
                                className={`flex items-center p-2 rounded-lg transition ${isActive
                                    ? "bg-white text-gray-900 font-bold"
                                    : "hover:bg-gray-400 hover:text-gray-800"
                                    }`}
                            >
                                {React.createElement(item.icon, { className: "w-5 h-5 mr-2" })}
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
};

const Header: React.FC<{ username: string | null | undefined, setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>> }> = ({ username, setSidebarOpen }) => (
    <header className="p-4 bg-white shadow-md flex items-center justify-between">
        <div className="flex items-center">
            <button className="md:hidden p-2 mr-2" onClick={() => setSidebarOpen(true)}>
                <Menu size={24} />
            </button>
            <span className="font-medium">Olá, {username?.split(" ")[0]}</span>
        </div>
        <button className="p-2 rounded-lg hover:bg-gray-200 transition" onClick={() => signOut({ callbackUrl: "/" })}>
            Logout
        </button>
    </header>
);

const Footer: React.FC<{ role: string | null | undefined }> = ({ role }) => (
    <footer className="p-4 text-center bg-gray shadow-md border-1 relative z-10 w-full">
        <p>&copy; {new Date().getFullYear()} {role === "ADMIN" ? "Admin Panel" : "User Panel"}</p>
    </footer>
);

export default Layout;
