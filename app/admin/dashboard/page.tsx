"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { ArrowDownCircle, ArrowUpCircle, BarChart2, Calendar, CreditCard, DollarSign, DollarSignIcon, PlayCircleIcon, Users } from "lucide-react";
import { formatCurrency, formatDate, formatHour } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


interface Stats {
  totalUsers: number;
  totalRevenue: number;
  totalExpenses: number;
  totalreservas: number;
  totalGoals: number;
  totalBudgets: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    totalreservas: 0,
    totalGoals: 0,
    totalBudgets: 0,
  });
  const [reservas, setreservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchTransationRecents = async () => {
    try {
      const response = await fetch("/api/admin/transations/recents");
      const data = await response.json();
      setreservas(data.reservas);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
    }


  }
  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats-admin");
      const data = await response.json();

      setStats({
        totalUsers: data.totalUsers,
        totalRevenue: data.totalIncome,
        totalExpenses: data.totalExpenses,
        totalreservas: data.totalreservas,
        totalGoals: data.activeGoals,
        totalBudgets: data.categoryBreakdown.length,
      });
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchTransationRecents();
  }, []);

  if (loading) {
    return <p className="text-center">Carregando dados...</p>;
  }

  const pieData = [
    { name: "Pendente", value: stats.totalRevenue },
    { name: "Confirmada", value: stats.totalExpenses },
    { name: "Concluído", value: stats.totalExpenses },
    { name: "Cancelada", value: stats.totalExpenses },


  ];
  const COLORS = ["#FFA500", "#3B82F6", "#22C55E", "#EF4444"]; // Pendente, Confirmada, Concluído, Cancelada

  const barData = [
    { name: "Metas", value: stats.totalGoals, color: "#4caf50" },
    { name: "Investimentos", value: stats.totalBudgets, color: "#ff6b6b" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Relatorio geral</h1>
      <p className="text-gray-600">Aqui você pode visualizar as estatísticas gerais do sistema.</p>

      <hr className="border-gray-300" />
      <h2 className="text-2xl font-light">Estatísticas Gerais</h2>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        {[{ title: "Usuários Registrados", value: stats.totalUsers, Icon: Users, color: "text-white", bgColor: "bg-blue-600" },
        { title: "Reservas", value: formatCurrency(stats.totalRevenue), Icon: Calendar, color: "text-white", bgColor: "bg-orange-400" },
        { title: "Quadras", value: formatCurrency(stats.totalExpenses), Icon: PlayCircleIcon, color: "text-white", bgColor: "bg-gray-700" },
        { title: "Saldo", value: stats.totalreservas, Icon: DollarSignIcon, color: "text-white", bgColor: "bg-green-600" },
        ].map(({ title, value, Icon, color, bgColor }, index) => (
          <Card key={index} className={`shadow-sm border border-gray-200 ${bgColor} p-4`}>
            <CardHeader className="flex items-center justify-center pb-2">
              <CardTitle className="text-sm font-medium text-white">{title}</CardTitle>
              <Icon className={`h-6 w-6 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-6xl font-bold text-white `}>{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4">
        {/* Tabela - 67% do espaço */}
        <Card className="w-[67%]   shadow-md border-1">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Últimas reservas </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Quadra</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservas?.map((reserva, index) => (
                  <TableRow key={index}>
                    <TableCell>{formatDate(new Date(reserva.date))}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      {reserva.type === "PENDENTE" ? (
                        <ArrowUpCircle className="text-green-500 w-5 h-5" />
                      ) : (
                        <ArrowDownCircle className="text-red-500 w-5 h-5" />
                      )}
                      {reserva.type}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          reserva.type === "DESPESA"
                            ? "bg-red-200 text-red-700 px-2 py-1 rounded-md"
                            : "bg-green-200 text-green-700 px-2 py-1 rounded-md"
                        }
                      >
                        {reserva.type === "RECEITA" ? "+" : "-"}{" "}
                        {formatCurrency(reserva.amount)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Gráficos - 33% do espaço */}
        <div className="w-[33%] flex flex-col gap-4">
          {/* PieChart */}
          <Card className="shadow-md border-1">
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Distribuição das  reservas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    label
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>


        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
