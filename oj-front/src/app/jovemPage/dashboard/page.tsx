"use client";

import Header from "@/components/Header";
import AppSidebar from "@/components/Sidebar";
import React, { useState, useEffect, useCallback } from "react";
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
import { supabase } from "@/lib/supabase";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Tipos para o componente
interface Avaliacao {
  created_at: string;
  notas?: string;
  habilidade?: string;
  feedback?: string;
}

interface DadosProcessados {
  mes: string;
  mesAno: string;
  notaMedia: number;
  habilidadesCount: number;
  feedbacks: string[];
  engajamento: number;
  totalAvaliacoes: number;
  desenvolvimentoScore: number;
}

const dadosExemplo: DadosProcessados[] = [
  { mes: "Jan", mesAno: "2024-01", notaMedia: 8.5, habilidadesCount: 3, engajamento: 4, desenvolvimentoScore: 6, totalAvaliacoes: 4, feedbacks: [] },
  { mes: "Fev", mesAno: "2024-02", notaMedia: 7.8, habilidadesCount: 2, engajamento: 3, desenvolvimentoScore: 4, totalAvaliacoes: 3, feedbacks: [] },
  { mes: "Mar", mesAno: "2024-03", notaMedia: 9.2, habilidadesCount: 4, engajamento: 5, desenvolvimentoScore: 8, totalAvaliacoes: 5, feedbacks: [] },
];

export default function Dashboard() {
  const [avaliacaoData, setAvaliacaoData] = useState<DadosProcessados[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const processarDadosPorMes = useCallback((dados: Avaliacao[]): DadosProcessados[] => {
    const dadosAgrupados: Record<string, {
      mes: string;
      mesAno: string;
      notas: number[];
      habilidades: string[];
      feedbacks: string[];
      totalAvaliacoes: number;
    }> = {};

    dados.forEach((avaliacao) => {
      const data = new Date(avaliacao.created_at);
      const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
      const mesNome = data.toLocaleDateString("pt-BR", { month: "short" });

      if (!dadosAgrupados[mesAno]) {
        dadosAgrupados[mesAno] = {
          mes: mesNome.charAt(0).toUpperCase() + mesNome.slice(1),
          mesAno: mesAno,
          notas: [],
          habilidades: [],
          feedbacks: [],
          totalAvaliacoes: 0,
        };
      }

      if (avaliacao.notas) {
        const notasArray = avaliacao.notas.split(",").map((n) => parseFloat(n.trim()));
        const notasValidas = notasArray.filter((n) => !isNaN(n) && n >= 0 && n <= 10);
        if (notasValidas.length > 0) {
          const media = notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length;
          dadosAgrupados[mesAno].notas.push(media);
        }
      }

      if (avaliacao.habilidade) {
        dadosAgrupados[mesAno].habilidades.push(avaliacao.habilidade);
      }

      if (avaliacao.feedback && avaliacao.feedback.trim().length > 0) {
        dadosAgrupados[mesAno].feedbacks.push(avaliacao.feedback);
      }

      dadosAgrupados[mesAno].totalAvaliacoes++;
    });

    return Object.entries(dadosAgrupados)
      .map(([mesAno, grupo]) => ({
        mes: grupo.mes,
        mesAno: mesAno,
        notaMedia:
          grupo.notas.length > 0
            ? grupo.notas.reduce((a, b) => a + b, 0) / grupo.notas.length
            : 0,
        habilidadesCount: grupo.habilidades.length,
        feedbacks: grupo.feedbacks, // <- manter o array com os textos
        engajamento: grupo.feedbacks.length,
        totalAvaliacoes: grupo.totalAvaliacoes,
        desenvolvimentoScore: [...new Set(grupo.habilidades)].length * 2,
      }))
      .sort((a, b) => new Date(a.mesAno).getTime() - new Date(b.mesAno).getTime());
  }, []);

  const fetchAvaliacaoData = useCallback(async (idJovem: string | number) => {
    try {
      setLoading(true);
      const query = supabase
        .from("avaliacao")
        .select(`*, jovem!inner(id_jovem, nome)`)
        .eq("id_jovem", idJovem)
        .order("created_at", { ascending: true });

      const { data, error: supabaseError } = await query;

      if (supabaseError) throw new Error(supabaseError.message);
      if (!data || data.length === 0) throw new Error("Nenhuma avaliação encontrada");

      const dadosProcessados = processarDadosPorMes(data as Avaliacao[]);
      setAvaliacaoData(dadosProcessados);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      setAvaliacaoData(dadosExemplo);
      console.error("Erro ao buscar avaliações:", err);
    } finally {
      setLoading(false);
    }
  }, [processarDadosPorMes]);

  useEffect(() => {
    const fetchUsuarioLogado = async () => {
      const usuarioSessao = localStorage.getItem("usuario_sessao");
      if (!usuarioSessao) return;
      
      try {
        const usuario = JSON.parse(usuarioSessao);
        if (usuario?.tipo === "jovem" && usuario?.id) {
          await fetchAvaliacaoData(usuario.id);
        }
      } catch (parseError) {
        console.error("Erro ao fazer parse do usuário da sessão:", parseError);
        setError("Erro ao carregar dados do usuário");
        setLoading(false);
      }
    };
    
    fetchUsuarioLogado();
  }, [fetchAvaliacaoData]);

  const dados = avaliacaoData.length > 0 ? avaliacaoData : dadosExemplo;

  const estatisticas = {
    notaMediaGeral: dados.reduce((acc, item) => acc + item.notaMedia, 0) / dados.length,
    totalHabilidades: dados.reduce((acc, item) => acc + item.habilidadesCount, 0),
    engajamentoTotal: dados.reduce((acc, item) => acc + item.engajamento, 0),
    totalAvaliacoesGeral: dados.reduce((acc, item) => acc + item.totalAvaliacoes, 0),
    desenvolvimentoMedio: dados.reduce((acc, item) => acc + item.desenvolvimentoScore, 0) / dados.length,
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

            {/* Carousel para os cards */}
            <Carousel
              opts={{ align: "start", loop: true }}
              className="mb-6"
            >
              <CarouselContent>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm text-center p-4">
                    <CardHeader>
                      <CardTitle className="text-xl text-gray-800">Nota Global</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-blue-600">
                        {estatisticas.notaMediaGeral.toFixed(2)}
                      </p>
                      <CardDescription>média geral das avaliações</CardDescription>
                    </CardContent>
                  </Card>
                </CarouselItem>

                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm text-center p-4">
                    <CardHeader>
                      <CardTitle className="text-xl text-gray-800">Média Mensal</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-green-600">
                        {dados.length > 0
                          ? dados[dados.length - 1].notaMedia.toFixed(2)
                          : "0.00"}
                      </p>
                      <CardDescription>nota do mês mais recente</CardDescription>
                    </CardContent>
                  </Card>
                </CarouselItem>

                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm text-center p-4">
                    <CardHeader>
                      <CardTitle className="text-xl text-gray-800">Feedbacks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-yellow-600">
                        {estatisticas.engajamentoTotal}
                      </p>
                      <CardDescription>total de feedbacks recebidos</CardDescription>
                    </CardContent>
                  </Card>
                </CarouselItem>

                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm text-center p-4">
                    <CardHeader>
                      <CardTitle className="text-xl text-gray-800">Notas do Mês</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {dados.length > 0 ? (
                        dados.map((item) => (
                          <div key={item.mesAno} className="mb-2">
                            <strong>{item.mes}:</strong> {item.notaMedia.toFixed(2)}
                          </div>
                        ))
                      ) : (
                        <p>Nenhuma nota disponível</p>
                      )}
                    </CardContent>
                  </Card>
                </CarouselItem>
              </CarouselContent>

              <CarouselPrevious />
              <CarouselNext />
            </Carousel>

            {/* Gráfico de linha apenas com nota média */}
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm p-4">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Evolução da Nota Média</CardTitle>
                <CardDescription>Visualização mensal da nota média</CardDescription>
              </CardHeader>
              <CardContent style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dados}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="mes"
                      tick={{ fill: "#374151", fontSize: 12 }}
                      axisLine={{ stroke: "#9ca3af" }}
                      tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <YAxis
                      tick={{ fill: "#374151", fontSize: 12 }}
                      axisLine={{ stroke: "#9ca3af" }}
                      domain={[0, 10]}
                    />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="linear"
                      dataKey="notaMedia"
                      stroke="#3b82f6"
                      name="Nota Média"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}