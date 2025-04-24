"use client";

import { useEffect, useState } from "react";
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

export default function DashboardFinanceiro() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats-finance")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error("Erro ao carregar dados do dashboard", err));
  }, []);

  if (!data) {
    return <p className="p-4">Carregando dados...</p>;
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

  return (
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
      </div>

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
    </div>
  );
}
