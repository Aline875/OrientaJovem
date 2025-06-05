"use client";

import Header from "@/components/Header";
import AppSidebar from "@/components/Sidebar";
import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from '@supabase/supabase-js';

// Configure seu Supabase (ajuste com suas credenciais)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Dashboard() {
  const [avaliacaoData, setAvaliacaoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jovemSelecionado, setJovemSelecionado] = useState(null);

  // Função para buscar dados da tabela avaliacao via Supabase
  const fetchAvaliacaoData = async (idJovem = null) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('avaliacao')
        .select(`
          *,
          jovem!inner(
            id_jovem,
            nome
          )
        `)
        .order('created_at', { ascending: true });

      // Se especificar um jovem, filtrar por ele
      if (idJovem) {
        query = query.eq('id_jovem', idJovem);
      }
      
      const { data, error: supabaseError } = await query;
      
      if (supabaseError) {
        throw new Error(`Erro do Supabase: ${supabaseError.message}`);
      }
      
      if (!data || data.length === 0) {
        throw new Error('Nenhuma avaliação encontrada');
      }
      
      // Processar dados para agrupar por mês
      const dadosProcessados = processarDadosPorMes(data);
      setAvaliacaoData(dadosProcessados);
      
    } catch (err) {
      setError(err.message);
      console.error('Erro ao buscar avaliações:', err);
      // Em caso de erro, usar dados de exemplo
      setAvaliacaoData(dadosExemplo);
    } finally {
      setLoading(false);
    }
  };

  // Função para processar dados e agrupar por mês
  const processarDadosPorMes = (dados) => {
    const dadosAgrupados = {};
    
    dados.forEach(avaliacao => {
      const data = new Date(avaliacao.created_at);
      const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      const mesNome = data.toLocaleDateString('pt-BR', { month: 'short' });
      
      if (!dadosAgrupados[mesAno]) {
        dadosAgrupados[mesAno] = {
          mes: mesNome.charAt(0).toUpperCase() + mesNome.slice(1),
          mesAno: mesAno,
          notas: [],
          habilidades: [],
          feedbacks: [],
          totalAvaliacoes: 0
        };
      }
      
      // Processar as notas (assumindo que podem estar em formato string)
      if (avaliacao.notas) {
        try {
          // Se for um número direto
          const nota = parseFloat(avaliacao.notas);
          if (!isNaN(nota) && nota >= 0 && nota <= 10) {
            dadosAgrupados[mesAno].notas.push(nota);
          }
        } catch (e) {
          // Se houver erro na conversão, tentar extrair números da string
          const notasNaString = avaliacao.notas.match(/\d+\.?\d*/g);
          if (notasNaString) {
            notasNaString.forEach(notaStr => {
              const nota = parseFloat(notaStr);
              if (!isNaN(nota) && nota >= 0 && nota <= 10) {
                dadosAgrupados[mesAno].notas.push(nota);
              }
            });
          }
        }
      }
      
      // Contar habilidades mencionadas (como proxy para desenvolvimento)
      if (avaliacao.habilidade) {
        dadosAgrupados[mesAno].habilidades.push(avaliacao.habilidade);
      }
      
      // Contar feedbacks (como proxy para engajamento)
      if (avaliacao.fedback && avaliacao.fedback.trim().length > 0) {
        dadosAgrupados[mesAno].feedbacks.push(avaliacao.fedback);
      }
      
      dadosAgrupados[mesAno].totalAvaliacoes++;
    });

    // Calcular métricas e retornar array ordenado
    return Object.entries(dadosAgrupados)
      .map(([mesAno, grupo]) => ({
        mes: grupo.mes,
        mesAno: mesAno,
        notaMedia: grupo.notas.length > 0 
          ? grupo.notas.reduce((a, b) => a + b, 0) / grupo.notas.length 
          : 0,
        habilidadesCount: grupo.habilidades.length,
        engajamento: grupo.feedbacks.length, // Quantidade de feedbacks como proxy para engajamento
        totalAvaliacoes: grupo.totalAvaliacoes,
        // Criar uma métrica de "desenvolvimento" baseada na variedade de habilidades
        desenvolvimentoScore: [...new Set(grupo.habilidades)].length * 2, // Habilidades únicas * 2
      }))
      .sort((a, b) => new Date(a.mesAno) - new Date(b.mesAno));
  };

  // Buscar lista de jovens para seleção
  const fetchJovens = async () => {
    try {
      const { data, error } = await supabase
        .from('jovem')
        .select('id_jovem, nome')
        .order('nome');

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar jovens:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchAvaliacaoData();
  }, []);

  // Dados de exemplo caso não consiga carregar da API
  const dadosExemplo = [
    { mes: "Jan", notaMedia: 8.5, habilidadesCount: 3, engajamento: 4, desenvolvimentoScore: 6, totalAvaliacoes: 4 },
    { mes: "Fev", notaMedia: 7.8, habilidadesCount: 2, engajamento: 3, desenvolvimentoScore: 4, totalAvaliacoes: 3 },
    { mes: "Mar", notaMedia: 9.2, habilidadesCount: 4, engajamento: 5, desenvolvimentoScore: 8, totalAvaliacoes: 5 },
    { mes: "Abr", notaMedia: 8.9, habilidadesCount: 3, engajamento: 4, desenvolvimentoScore: 6, totalAvaliacoes: 4 },
    { mes: "Mai", notaMedia: 9.5, habilidadesCount: 5, engajamento: 6, desenvolvimentoScore: 10, totalAvaliacoes: 6 },
    { mes: "Jun", notaMedia: 8.7, habilidadesCount: 3, engajamento: 4, desenvolvimentoScore: 6, totalAvaliacoes: 4 },
  ];

  const dados = avaliacaoData.length > 0 ? avaliacaoData : dadosExemplo;
  
  // Calcular estatísticas gerais
  const estatisticas = {
    notaMediaGeral: dados.length > 0 ? dados.reduce((acc, item) => acc + item.notaMedia, 0) / dados.length : 0,
    totalHabilidades: dados.reduce((acc, item) => acc + item.habilidadesCount, 0),
    engajamentoTotal: dados.reduce((acc, item) => acc + item.engajamento, 0),
    totalAvaliacoesGeral: dados.reduce((acc, item) => acc + item.totalAvaliacoes, 0),
    desenvolvimentoMedio: dados.length > 0 ? dados.reduce((acc, item) => acc + item.desenvolvimentoScore, 0) / dados.length : 0
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-t from-[#1A5579] to-[#2A2570] flex items-center justify-center">
        <div className="text-white text-xl">Carregando dados de avaliação...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-t from-[#1A5579] to-[#2A2570]">
      <Header />
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 px-4 py-6 pt-20 lg:ml-4">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Desempenho do Jovem</h1>
              <p className="text-blue-200">
                Acompanhamento do desenvolvimento e progresso ao longo dos meses
              </p>
              {error && (
                <p className="text-yellow-300 mt-2 text-sm">
                  ⚠️ Dados de exemplo exibidos. Verifique a conexão com o Supabase.
                </p>
              )}
            </div>

            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-800">
                  Evolução do Desempenho
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Gráfico de linha mostrando a evolução das notas, habilidades e engajamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dados}
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
                        tick={{ fill: "#374151", fontSize: 12 }}
                        axisLine={{ stroke: "#9ca3af" }}
                      />
                      <YAxis
                        tick={{ fill: "#374151", fontSize: 12 }}
                        axisLine={{ stroke: "#9ca3af" }}
                        domain={[0, 'dataMax']}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                        labelStyle={{ color: "#374151", fontWeight: "bold" }}
                        formatter={(value, name) => [
                          typeof value === 'number' ? value.toFixed(1) : value,
                          name === 'notaMedia' ? 'Nota Média' :
                          name === 'habilidadesCount' ? 'Habilidades Trabalhadas' :
                          name === 'engajamento' ? 'Engajamento (Feedbacks)' :
                          name === 'desenvolvimentoScore' ? 'Score de Desenvolvimento' : name
                        ]}
                      />
                      <Legend wrapperStyle={{ paddingTop: "20px" }} />
                      <Line
                        type="monotone"
                        dataKey="notaMedia"
                        stroke="#3b82f6"
                        name="Nota Média"
                        strokeWidth={3}
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: "#3b82f6", strokeWidth: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="desenvolvimentoScore"
                        stroke="#10b981"
                        name="Score de Desenvolvimento"
                        strokeWidth={3}
                        dot={{ fill: "#10b981", strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: "#10b981", strokeWidth: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="engajamento"
                        stroke="#f59e0b"
                        name="Engajamento"
                        strokeWidth={3}
                        dot={{ fill: "#f59e0b", strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: "#f59e0b", strokeWidth: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="habilidadesCount"
                        stroke="#8b5cf6"
                        name="Habilidades Trabalhadas"
                        strokeWidth={3}
                        dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: "#8b5cf6", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-800">
                    Nota Média Geral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {estatisticas.notaMediaGeral.toFixed(1)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">De 0 a 10</p>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-800">
                    Habilidades Trabalhadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {estatisticas.totalHabilidades}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Total no período</p>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-800">
                    Engajamento Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-600">
                    {estatisticas.engajamentoTotal}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Feedbacks recebidos</p>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-800">
                    Total de Avaliações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {estatisticas.totalAvaliacoesGeral}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Registros no período</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}