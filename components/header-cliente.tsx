import { Link, Menu } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import logoImage from "@/app/assets/image/logo.png";
const HeaderCliente: React.FC<{ username: string | null | undefined, setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>> }> = ({ username, setSidebarOpen }) => (
    <header className="p-4 bg-white shadow-md flex items-center justify-between">
        <div className="container mx-auto flex justify-between items-center px-4 md:px-8">

            {/* Logo */}
            <Link href="/" className="text-2xl font-bold flex items-center">
                <Image src={logoImage} alt="Logo" className="w-20 h-10" />
            </Link>
     
        <div className="flex items-center">
            <button className="md:hidden p-2 mr-2" onClick={() => setSidebarOpen(true)}>
                <Menu size={24} />
            </button>
            <span className="font-medium">Olá, {username?.split(" ")[0]}</span>
        </div>
        <button className="p-2 rounded-lg hover:bg-gray-200 transition" onClick={() => signOut({ callbackUrl: "/" })}>
            Logout
        </button>
        </div>
    </header>
);
export default HeaderCliente;