"use client";

import { withRole } from "@/components/withRole";
import Loading from "@/loading";
import { Suspense, useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend, CartesianGrid
} from "recharts";

interface PaymentDetail {
  id: string;
  court: string;
  usuario: string;
  valor: number;
  metodo: string;
  data: string;
}

interface DashboardData {
  totalArrecadado: number;
  quantidadePagamentos: number;
  valoresPorMetodo: Record<string, number>;
  pagamentosPorMes: Record<string, number>;
  pagamentosDetalhados: PaymentDetail[];
}

function DashboardFinanceiro() {

  const [dataQuadras, setDataQuadras] = useState<{
    topCourts: any[],
    topCategories: any[],
    allCourts: any[],
  } | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch('/api/admin/stats-admin/courts')
      const json = await res.json()
      console.log("estatiticas", json);

      setDataQuadras(json)
    }
    fetchStats()
  }, [])

  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats-finance")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error("Erro ao carregar dados do dashboard", err));
  }, []);

  if (!data) {
    return <Suspense fallback={<Loading></Loading>}>

    </Suspense>;
  }

  const metodoChartData = {
    labels: Object.keys(data.valoresPorMetodo),
    datasets: [
      {
        label: "Valor arrecadado",
        data: Object.values(data.valoresPorMetodo),
        backgroundColor: ["#EF4444", "#3B82F6", "#10B981", "#F59E0B"],
      }
    ]
  };

  const mesChartData = {
    labels: Object.keys(data.pagamentosPorMes),
    datasets: [
      {
        label: "Pagamentos por mês",
        data: Object.values(data.pagamentosPorMes),
        backgroundColor: "#3B82F6"
      }
    ]
  };

  const renderCustomLabel = ({ name, percent }: any) => {
    return `${name} (${(percent * 100).toFixed(0)}%)`;
  };


  return (
    <Suspense fallback={<Loading></Loading>}>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Relatório Financeiro</h1>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl shadow bg-white">
            <p className="text-gray-500">Total Arrecadado</p>
            <p className="text-3xl font-bold text-green-600">Kz {data.totalArrecadado.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-2xl shadow bg-white">
            <p className="text-gray-500">Pagamentos Concluídos</p>
            <p className="text-3xl font-bold text-blue-600">{data.quantidadePagamentos}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-2">Arrecadação por Método</h2>

            <PieChart width={400} height={400}>
              <Pie
                data={Object.entries(data.valoresPorMetodo).map(([name, value]) => ({ name, value }))}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                label
                dataKey="value"
              >
                {Object.entries(data.valoresPorMetodo).map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={["#EF4444", "#3B82F6", "#10B981", "#F59E0B"][index % 4]}
                  />
                ))}
              </Pie>
            </PieChart>

            {/* Listagem dos métodos abaixo do gráfico */}
            <div className="mt-6 space-y-2">
              {Object.entries(data.valoresPorMetodo).map(([name, value], index) => {
                const total = Object.values(data.valoresPorMetodo).reduce(
                  (acc: number, val: any) => acc + val,
                  0
                );
                const percent = ((value / total) * 100).toFixed(1);

                return (
                  <div key={name} className="flex items-center space-x-2">
                    {/* Bolinha da cor correspondente */}
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: ["#EF4444", "#3B82F6", "#10B981", "#F59E0B"][index % 4] }}
                    />
                    <span className="text-gray-700 font-medium">{name}</span>
                    <span className="text-gray-500 text-sm">({percent}%)</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-2">Pagamentos por Mês</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={Object.entries(data.pagamentosPorMes).map(([month, value]) => ({ month, value }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div >

        <div className="bg-white p-4 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-4">Detalhamento</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2">Data</th>
                  <th className="p-2">Usuário</th>
                  <th className="p-2">Quadra</th>
                  <th className="p-2">Método</th>
                  <th className="p-2">Valor</th>
                </tr>
              </thead>
              <tbody>
                {data.pagamentosDetalhados.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="p-2">{new Date(p.data).toLocaleDateString()}</td>
                    <td className="p-2">{p.usuario}</td>
                    <td className="p-2">{p.court}</td>
                    <td className="p-2">{p.metodo}</td>
                    <td className="p-2">Kz {p.valor.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div >



      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Estatísticas de Quadras e Categorias</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gráfico de Barras - Quadras mais reservadas */}
          <div className="bg-white p-4 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-2">Quadras Mais Reservadas</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={dataQuadras?.topCourts.map((court: any) => ({
                  name: court.name,
                  reservas: court.reservas,
                }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="reservas" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Pizza - Categorias mais reservadas */}
          <div className="bg-white p-4 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-2">Categorias Mais Reservadas</h2>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dataQuadras?.topCategories.map((cat: any) => ({
                    name: cat.name,
                    value: cat.bookings,
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  dataKey="value"
                >
                  {dataQuadras?.topCategories.map((_: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={["#3B82F6", "#F59E0B", "#EF4444", "#10B981"][index % 4]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Infos embaixo */}
            <div className="mt-6 space-y-2">
              {dataQuadras?.topCategories.map((cat: any, index: number) => {
                const totalBookings = dataQuadras.topCategories.reduce(
                  (acc: number, item: any) => acc + item.bookings,
                  0
                );
                const percent = ((cat.bookings / totalBookings) * 100).toFixed(1);

                return (
                  <div key={cat.id} className="flex items-center space-x-2">
                    {/* Bolinha da cor correspondente */}
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: ["#3B82F6", "#F59E0B", "#EF4444", "#10B981"][index % 4] }}
                    />
                    <span className="text-gray-700 font-medium">{cat.name}</span>
                    <span className="text-gray-500 text-sm">({percent}%)</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
        {/* Tabela Detalhada
        <div className="bg-white p-4 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-4">Todas as Quadras e Categorias</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2">Quadra</th>
                  <th className="p-2">Preço/Hora</th>
                  <th className="p-2">Cidade</th>
                  <th className="p-2">Categorias</th>
                </tr>
              </thead>
              <tbody>
                {dataQuadras?.allCourts?.map((court: any) => (
                  <tr key={court.id} className="border-b">
                    <td className="p-2">{court.name}</td>
                    <td className="p-2">Kz {court?.pricePerHour.toLocaleString()}</td>
                    <td className="p-2">{court?.city}</td>
                    <td className="p-2">{court.category?.map((c: any) => c.name).join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div> */}
      </div>
    </Suspense>

  );
}

export default withRole(DashboardFinanceiro, ["administrador"])
