'use client'
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React, { Suspense, useMemo, useState } from "react";
import { LogOut, Menu, User, UserCircle, X } from "lucide-react";
import Loading from "@/loading";
import Image from "next/image";
import logo from '@/app/assets/image/logo.png';
import { MenuGroup, Role, MenuItem, MenuIcon } from "@/app/navmenu";
import { getMenuForRole } from '@/lib/getMenuForRole'

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

    const role = session?.user?.role as Role | undefined;
    const username = session?.user?.name;

    const menuItems: MenuGroup[] = role ? getMenuForRole(role) : [];


    return (
        <div className="flex min-h-screen">
            {/* Sidebar fixa no desktop, responsiva no mobile */}
            <Sidebar role={role} menuItems={menuItems} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="flex flex-col flex-1 md:ml-64">
                <Suspense fallback={<Loading></Loading>} >
                    <Header profile={role} username={username} setSidebarOpen={setSidebarOpen} />
                    <main className="flex-1 p-6 mt-8 overflow-auto pb-16">{status === "authenticated" ? children : <Skeleton />}</main>
                </Suspense>
                <Footer role={role} />
            </div>
        </div>
    );
};

const Sidebar: React.FC<{
    role: string | null | undefined;
    menuItems: MenuGroup[];
    sidebarOpen: boolean;
    setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ role, menuItems, sidebarOpen, setSidebarOpen }) => {
    const pathname = usePathname();

    const renderLink = (item: MenuItem) => {
        const isActive = pathname === item.link;
        return (
            <Link
                key={`${item.link}-${item.name}`}
                href={item.link}
                className={`flex items-center mt-2 mb-4 p-2 rounded-lg transition ${isActive ? "bg-white text-gray-900 font-light" : "hover:bg-gray-400 hover:text-gray-800"
                    }`}
            >
                {React.createElement(item.icon, { className: "w-5 h-5 mr-2" })}
                {item.name}
            </Link>
        );
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="fixed  top-0 left-0 w-64 h-screen p-4 bg-dark-base text-white shadow-lg hidden md:flex flex-col z-50 overflow-y-auto">

                <div className="flex items-center justify-center bg-white mb-6">
                    <div className="h-26 w-26 rounded-full bg-white flex items-center justify-center">
                        <Image src={logo} alt="Logo" width={40} height={40} className="h-12 w-auto" />
                    </div>
                </div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-sm text-white p-4 font-bold">{"PAINEL " + role}</h2>
                </div>
                <hr />
                <nav className="mt-4 space-y-2">
                    {menuItems.map((group) => (
                        <div key={group.title}>
                            <h3 className="text-gray-500 mt-8 mb-1 text-sm uppercase">{group.title}</h3>
                            {group.children.map(renderLink)}
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Mobile Sidebar */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>
            )}
            <aside
                className={`fixed top-0 left-0 w-64 h-screen p-4 bg-black text-white shadow-lg z-50 transition-transform flex flex-col md:hidden overflow-y-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >

                <button className="absolute top-4 right-4 text-white" onClick={() => setSidebarOpen(false)}>
                    <X size={24} />
                </button>
                <div className="flex items-center justify-center mb-6">
                    <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center">
                        <Image src={logo} alt="Logo" width={40} height={40} className="h-12 w-auto" />
                    </div>
                </div>
                <div className="flex items-center rounded-lg justify-between mb-6 bg-white">
                    <h2 className="text-xl text-black p-4 font-bold">{"Painel de " + role}</h2>
                </div>
                <nav className="mt-4 space-y-2">
                    {menuItems.map((group) => (
                        <div key={group.title}>
                            <h3 className="text-gray-400 text-sm uppercase">{group.title}</h3>
                            {group.children.map(renderLink)}
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    );
};

const Header: React.FC<{
    profile: string | undefined,
    username: string | null | undefined,
    setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
}> = ({ username, profile, setSidebarOpen }) => (
    <header className="p-2 bg-white shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
            <button
                className="md:hidden p-2"
                onClick={() => setSidebarOpen(true)}
                aria-label="Abrir menu"
            >
                <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
                <UserCircle height={40} width={40} className="text-gray-700" />
                <div className="flex flex-col">
                    <span className="font-medium">{username?.split(" ")[0]}</span>
                    <span className="font-light text-xs text-gray-500">{profile && `(${profile})`}</span>
                </div>
            </div>
        </div>
        <button
            className="p-3 rounded-lg flex items-center gap-2 hover:bg-gray-200 text-red-600 transition"
            onClick={() => signOut({ callbackUrl: "/" })}
        >
            <LogOut size={20} />
            <span>Terminar sessão</span>
        </button>
    </header>
);

const Footer: React.FC<{ role: string | null | undefined }> = ({ role }) => (
    <footer className="p-4 text-center bg-gray-100 shadow-md border border-gray-200 w-full">
        <p>&copy; {new Date().getFullYear()} Área do {role}</p>
    </footer>

);

export default Layout;
