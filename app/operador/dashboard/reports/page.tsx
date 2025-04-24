"use client"
import { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export default function ReportsPage() {
  interface StatsData {
    totalIncome: number;
    totalExpenses: number;
    categoryBreakdown: { name: string; value: number }[];
  }

  const [data, setData] = useState<StatsData | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  if (!data) return <p>Carregando...</p>;

  const barData = [
    { name: 'Receita', valor: data.totalIncome, color: "#4caf50" },
    { name: 'Despesa', valor: data.totalExpenses, color: "#ff6b6b" },
  ];

  const pieData = data.categoryBreakdown.map((cat) => ({ name: cat.name, value: cat.value }));
  const colors = ["#FFCE56","#4caf50", "#36A2EB",  "#4BC0C0", "#9966FF", "#FF9F40"];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Relatórios do Sistema</h1>
      
      {/* Gráfico de Barras */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Receita vs Despesa</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={barData} barSize={50}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {barData.map((entry, index) => (
              <Bar key={index} dataKey="valor" fill={entry.color} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Gráfico de Pizza */}
      <div className="bg-white p-4  rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Gastos por Categoria</h2>
        <ResponsiveContainer width="100%" height={600}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={250} label>
              {pieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
