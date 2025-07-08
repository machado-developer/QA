import { GiSoccerField } from 'react-icons/gi';


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
  Shield,
  LucideIcon
} from "lucide-react";
import { SoccerBall, Volleyball, Basketball, TennisBall, HandPalm, PersonSimpleRun, Money } from "phosphor-react";
import { IconType } from 'react-icons/lib';

export type Role = | 'ADMINISTRADOR' | 'OPERADOR' | 'CLIENTE'
export type MenuIcon = IconType | LucideIcon;
export type MenuItem = {
  name: string;
  link: string;
  icon: MenuIcon;
  type: "item";
  roles: Role[];
};

export type MenuGroup = {
  title: string;
  type: 'group';
  roles: Role[];
  children: MenuItem[];
};

type Sport = {
  nome: string;
  slug: string;
  Icon: React.ElementType | IconType;
};

const pathAmin = "/admin/dashboard/";

const menus: MenuGroup[] = [
  {
    title: "Administração",
    type: "group",
    roles: ["ADMINISTRADOR"],
    children: [
      { name: "Dashboard", link: pathAmin, icon: LayoutDashboard, type: "item", roles: ["ADMINISTRADOR"] },
      { name: "Reservas", link: `${pathAmin}books`, icon: CalendarDays, type: "item", roles: ["ADMINISTRADOR", "OPERADOR"] },
      { name: "Finanças", link: `${pathAmin}payments`, icon: DollarSign, type: "item", roles: ["ADMINISTRADOR", 'OPERADOR'] },
      { name: "Relatórios & Estatisticas", link: `${pathAmin}reports`, icon: BarChart4, type: "item", roles: ["ADMINISTRADOR"] },
      { name: "Quadras", link: `${pathAmin}cuart`, icon: GiSoccerField, type: "item", roles: ["ADMINISTRADOR", 'OPERADOR'] },
      { name: "Categorias", link: `${pathAmin}categories`, icon: ListCollapse, type: "item", roles: ["ADMINISTRADOR"] },
      { name: "Usuários", link: `${pathAmin}users`, icon: Users, type: "item", roles: ["ADMINISTRADOR"] },
      { name: "Auditoria", link: `${pathAmin}logs`, icon: Shield, type: "item", roles: ["ADMINISTRADOR"] },
    ]
  },

  {
    title: "AGENDAMENTOS",
    type: "group",
    roles: ["OPERADOR"],
    children: [
      { name: "Reservas", link: `${pathAmin}books`, icon: CalendarDays, type: "item", roles: ["ADMINISTRADOR", "OPERADOR"] },
    ]
  },
  {
    title: "Gestão de Quadras",
    type: "group",
    roles: ["OPERADOR"],
    children: [
      { name: "Quadras", link: `${pathAmin}cuart`, icon: GiSoccerField, type: "item", roles: ["ADMINISTRADOR", 'OPERADOR'] },
    ]
  },
  {
    title: "ÁREA FINANCEIRA",
    type: "group",
    roles: ["OPERADOR"],
    children: [
      { name: "Finanças", link: `${pathAmin}payments`, icon: DollarSign, type: "item", roles: ["ADMINISTRADOR", 'OPERADOR'] },
    ]
  }
];






const esportesMenu: Sport[] = [
  { nome: "Futebol", slug: "futebol", Icon: SoccerBall },
  { nome: "Voleibol", slug: "voleibol", Icon: Volleyball },
  { nome: "Basquetebol", slug: "basquetebol", Icon: Basketball },
  { nome: "Ténis", slug: "tenis", Icon: TennisBall },
  { nome: "Padel", slug: "padel", Icon: TennisBall },
  { nome: "Andebol", slug: "andebol", Icon: HandPalm },
  { nome: "Futsal", slug: "futsal", Icon: SoccerBall },
  { nome: "Atletismo", slug: "atletismo", Icon: PersonSimpleRun },
];


export { menus, esportesMenu };
