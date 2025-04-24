"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend, CartesianGrid
} from "recharts";
import {
  ArrowDownCircle, ArrowUpCircle, Calendar,
  DollarSignIcon, PlayCircleIcon, Users
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const COLORS = ["#FFA500", "#3B82F6", "#EF4444", "#22C55E"]; // Pendente, Confirmado, Cancelado, Concluído

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalCourts: 0,
    bookings: {
      TOTAL: 0,
      PENDENTE: 0,
      CONFIRMADO: 0,
      CANCELADO: 0,
      CONCLUIDO: 0,
    },
    totalRecebido: 0,
    latestBookings: [],
    totalReviews: 0,
    unreadNotifications: 0,
    activePaymentMethods: [],
  });

  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats-admin");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <p className="text-center">Carregando dados...</p>;

  const pieData = [
    { name: "Pendente", value: stats.bookings.PENDENTE },
    { name: "Confirmado", value: stats.bookings.CONFIRMADO },
    { name: "Cancelado", value: stats.bookings.CANCELADO },
    { name: "Concluído", value: stats.bookings.CONCLUIDO },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Relatório Geral</h1>
      <p className="text-gray-600">Aqui você pode visualizar as estatísticas gerais do sistema.</p>

      <hr className="border-gray-300" />
      <h2 className="text-2xl font-light">Estatísticas Gerais</h2>

      {/* Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { title: "Usuários Registrados", value: stats.totalUsers, Icon: Users, bgColor: "bg-blue-600" },
          { title: "Total de Reservas", value: stats.bookings.TOTAL, Icon: Calendar, bgColor: "bg-orange-400" },
          { title: "Quadras Registradas", value: stats.totalCourts, Icon: PlayCircleIcon, bgColor: "bg-gray-700" },
          { title: "Total Recebido", value: formatCurrency(stats.totalRecebido), Icon: DollarSignIcon, bgColor: "bg-green-600" },
        ].map(({ title, value, Icon, bgColor }, index) => (
          <Card key={index} className={`shadow-sm border border-gray-200 ${bgColor} p-4`}>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white">{title}</CardTitle>
              <Icon className="h-6 w-6 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Tabela de reservas */}
        <Card className="w-full lg:w-2/3 shadow-md border">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Últimas Reservas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Quadra</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.latestBookings.map((reserva: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{formatDate(new Date(reserva.createdAt))}</TableCell>
                    <TableCell>{reserva.user?.name || "N/A"}</TableCell>
                    <TableCell>{reserva.court?.name || "N/A"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-md font-medium text-sm
                        ${reserva.status === "PENDENTE" ? "bg-yellow-200 text-yellow-800" :
                          reserva.status === "CONFIRMADO" ? "bg-blue-200 text-blue-800" :
                            reserva.status === "CANCELADO" ? "bg-red-200 text-red-800" :
                              "bg-green-200 text-green-800"}`}>
                        {reserva.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Gráfico Pizza */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          <Card className="shadow-md border">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Distribuição de Reservas</CardTitle>
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
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
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
