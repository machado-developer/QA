'use client'

import {
    Coins,
    DollarSign,
    Goal,
    Home,
    LayoutDashboard,
    ListCollapse,
    LogOut,
    Logs,
    Receipt,
    Settings,
    User,
    Users,
    BarChart4,
    PlayCircle,
    CalendarDays,
    Shield
} from "lucide-react";
const pathAmin = "/admin/dashboard/";
const adminMenu = [
    { name: "Dashboard", link: pathAmin, icon: LayoutDashboard },
    { name: "Usuários", link: `${pathAmin}users`, icon: Users },
    { name: "Quadras", link: `${pathAmin}cuart`, icon: PlayCircle },
    { name: "Categorias", link: `${pathAmin}categories `, icon: ListCollapse },
    { name: "Pagamentos", link: `${pathAmin}payments `, icon: DollarSign },
    { name: "Metodo  de Pagamentos", link: `${pathAmin}payments-methods`, icon: DollarSign },

    { name: "Reservas", link: `${pathAmin}books `, icon: CalendarDays },
    { name: "Relatórios & Estatisticas", link: `${pathAmin}reports`, icon: BarChart4 },
    {
        name: "Auditoria", link: `${pathAmin}logs`, icon: Shield
    },

];


const operadorMenu = [
    { name: "Dashboard", link: pathAmin, icon: LayoutDashboard },
    { name: "Quadras", link: `${pathAmin}cuart`, icon: PlayCircle },
    { name: "Pagamentos", link: `${pathAmin}payments `, icon: DollarSign },
    { name: "Reservas", link: `${pathAmin}books `, icon: CalendarDays },
];

export { adminMenu, operadorMenu };
