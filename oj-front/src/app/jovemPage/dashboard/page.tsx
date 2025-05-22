"use client";

import Header from "@/components/Header";
import AppSidebar from "@/components/Sidebar";
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const data = [
  {
    mes: 'Jan',
    vendas: 4000,
    lucro: 2400,
  },
  {
    mes: 'Fev',
    lucro: 1398,
    vendas: 3000,
  },
  {
    mes: 'Mar',
    vendas: 2000,
    lucro: 9800,
  },
  {
    mes: 'Abr',
    vendas: 2780,
    lucro: 3908,
  },
  {
    mes: 'Mai',
    vendas: 1890,
    lucro: 4800,
  },
  {
    mes: 'Jun',
    vendas: 2390,
    lucro: 3800,
  },
  {
    mes: 'Jul',
    vendas: 3490,
    lucro: 4300,
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-t from-[#1A5579] to-[#2A2570]">
      <Header />
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 px-4 py-6 pt-20 lg:ml-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Desempenho</h1>
            <p className="text-blue-200">Visão geral do desempenho dos ultimos meses</p>
          </div>
          
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-800">Relatório de Vendas e Lucro</CardTitle>
              <CardDescription className="text-gray-600">
                Comparativo mensal de vendas e lucro dos últimos 7 meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis 
                      dataKey="mes" 
                      tick={{ fill: '#374151', fontSize: 12 }}
                      axisLine={{ stroke: '#9ca3af' }}
                    />
                    <YAxis 
                      tick={{ fill: '#374151', fontSize: 12 }}
                      axisLine={{ stroke: '#9ca3af' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                    <Bar 
                      dataKey="vendas" 
                      fill="#3b82f6" 
                      name="Vendas (R$)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="lucro" 
                      fill="#10b981" 
                      name="Lucro (R$)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-gray-800">Total de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  R$ {data.reduce((acc, item) => acc + item.vendas, 0).toLocaleString()}
                </div>
                <p className="text-sm text-gray-600 mt-1">Últimos 7 meses</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-gray-800">Total de Lucro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  R$ {data.reduce((acc, item) => acc + item.lucro, 0).toLocaleString()}
                </div>
                <p className="text-sm text-gray-600 mt-1">Últimos 7 meses</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-gray-800">Margem Média</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {((data.reduce((acc, item) => acc + item.lucro, 0) / data.reduce((acc, item) => acc + item.vendas, 0)) * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600 mt-1">Lucro/Vendas</p>
              </CardContent>
            </Card>
          </div>
        </div>
        </main>
      </div>
    </div>
  );
}