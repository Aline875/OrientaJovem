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
  BarChart,
  Bar,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { TrendingUp, TrendingDown, Users, Target, Award, Building2 } from "lucide-react";

// Interfaces para tipagem
interface Usuario {
  id: string | number;
  tipo: string;
  nome?: string;
  email?: string;
}

interface Empresa {
  id_empresa: string | number;
  nome_empresa: string;
  cnpj: string;
  email_empresa: string;
}

interface Jovem {
  id_jovem: string | number;
  nome: string;
  email: string;
  data_nascimento?: string;
  telefone?: string;
  id_empresa: string | number;
}

interface Avaliacao {
  id_avaliacao: string | number;
  id_jovem: string | number;
  notas?: string;
  habilidade?: string;
  feedback?: string;
  created_at: string;
  jovem?: {
    id_jovem: string | number;
    nome: string;
  };
}

interface DadosGrafico {
  mes: string;
  mesAno: string;
  notaMedia: number;
  habilidadesCount: number;
  engajamento: number;
  desenvolvimentoScore: number;
  totalAvaliacoes: number;
  feedbacks?: string[];
}

export default function Dashboard() {
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [empresaLogada, setEmpresaLogada] = useState<Empresa | null>(null);
  const [jovensEmpresa, setJovensEmpresa] = useState<Jovem[]>([]);
  const [jovemSelecionado, setJovemSelecionado] = useState<Jovem | null>(null);
  const [avaliacaoData, setAvaliacaoData] = useState<DadosGrafico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    verificarSessaoECarregarDados();
  }, []);

  useEffect(() => {
    if (jovemSelecionado) {
      fetchAvaliacaoData(jovemSelecionado.id_jovem);
    }
  }, [jovemSelecionado]);

  const verificarSessaoECarregarDados = async () => {
    try {
      setLoading(true);
      
      // Verificar se há sessão ativa
      const sessaoString = localStorage.getItem("usuario_sessao");
      if (!sessaoString) {
        window.location.href = "/login";
        return;
      }

      const sessao: Usuario = JSON.parse(sessaoString);
      setUsuarioLogado(sessao);

      // Se for empresa, carregar dados da empresa e seus jovens
      if (sessao.tipo === "empresa") {
        await carregarDadosEmpresa(sessao.id);
      } else {
        // Se for jovem, redirecionar ou mostrar erro
        setError("Acesso restrito a empresas");
        return;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError("Erro ao verificar sessão: " + errorMessage);
      console.error("Erro ao verificar sessão:", err);
    } finally {
      setLoading(false);
    }
  };

  const carregarDadosEmpresa = async (idEmpresa: string | number) => {
    try {
      // Buscar dados da empresa logada
      const { data: empresaData, error: empresaError } = await supabase
        .from("empresa")
        .select("id_empresa, nome_empresa, cnpj, email_empresa")
        .eq("id_empresa", idEmpresa)
        .single();

      if (empresaError) throw new Error(empresaError.message);
      
      setEmpresaLogada(empresaData);

      // Buscar jovens da empresa logada
      await fetchJovensEmpresa(idEmpresa);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      console.error("Erro ao carregar dados da empresa:", err);
      
      // Dados de exemplo se não conseguir conectar
      const empresaExemplo: Empresa = {
        id_empresa: usuarioLogado?.id || 1,
        nome_empresa: usuarioLogado?.nome || "Tech Solutions Ltda",
        cnpj: "12.345.678/0001-90",
        email_empresa: usuarioLogado?.email || "contato@techsolutions.com"
      };
      setEmpresaLogada(empresaExemplo);
      
      const jovensExemplo: Jovem[] = [
        { 
          id_jovem: 1, 
          nome: "Ana Silva", 
          email: "ana@email.com", 
          data_nascimento: "2000-05-15",
          telefone: "(11) 99999-1111",
          id_empresa: empresaExemplo.id_empresa
        },
        { 
          id_jovem: 2, 
          nome: "Carlos Santos", 
          email: "carlos@email.com", 
          data_nascimento: "1999-08-22",
          telefone: "(11) 99999-2222",
          id_empresa: empresaExemplo.id_empresa
        }
      ];
      setJovensEmpresa(jovensExemplo);
      setJovemSelecionado(jovensExemplo[0]);
    }
  };

  const fetchJovensEmpresa = async (idEmpresa: string | number) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from("jovem")
        .select(`
          id_jovem, 
          nome, 
          email, 
          id_empresa
        `)
        .eq("id_empresa", idEmpresa)
        .order("nome");

      if (supabaseError) throw new Error(supabaseError.message);
      
      setJovensEmpresa(data || []);
      if (data && data.length > 0) {
        setJovemSelecionado(data[0]);
      } else {
        setJovemSelecionado(null);
        setAvaliacaoData([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      console.error("Erro ao buscar jovens da empresa:", err);
    }
  };

  const fetchAvaliacaoData = async (idJovem: string | number) => {
    try {
      const query = supabase
        .from("avaliacao")
        .select(`*, jovem!inner(id_jovem, nome)`)
        .eq("id_jovem", idJovem)
        .order("created_at", { ascending: true });

      const { data, error: supabaseError } = await query;

      if (supabaseError) throw new Error(supabaseError.message);
      
      if (!data || data.length === 0) {
        // Se não há dados reais, usar dados de exemplo
        setAvaliacaoData(dadosExemplo);
        return;
      }

      const dadosProcessados = processarDadosPorMes(data);
      setAvaliacaoData(dadosProcessados);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      setAvaliacaoData(dadosExemplo);
      console.error("Erro ao buscar avaliações:", err);
    }
  };

  const processarDadosPorMes = (dados: Avaliacao[]): DadosGrafico[] => {
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
        feedbacks: grupo.feedbacks,
        engajamento: grupo.feedbacks.length,
        totalAvaliacoes: grupo.totalAvaliacoes,
        desenvolvimentoScore: [...new Set(grupo.habilidades)].length * 2,
      }))
      .sort((a, b) => new Date(a.mesAno).getTime() - new Date(b.mesAno).getTime());
  };

  const dadosExemplo: DadosGrafico[] = [
    { mes: "Jan", mesAno: "2024-01", notaMedia: 8.5, habilidadesCount: 3, engajamento: 4, desenvolvimentoScore: 6, totalAvaliacoes: 4 },
    { mes: "Fev", mesAno: "2024-02", notaMedia: 7.8, habilidadesCount: 2, engajamento: 3, desenvolvimentoScore: 4, totalAvaliacoes: 3 },
    { mes: "Mar", mesAno: "2024-03", notaMedia: 9.2, habilidadesCount: 4, engajamento: 5, desenvolvimentoScore: 8, totalAvaliacoes: 5 },
    { mes: "Abr", mesAno: "2024-04", notaMedia: 8.7, habilidadesCount: 3, engajamento: 4, desenvolvimentoScore: 6, totalAvaliacoes: 4 },
    { mes: "Mai", mesAno: "2024-05", notaMedia: 9.0, habilidadesCount: 5, engajamento: 6, desenvolvimentoScore: 10, totalAvaliacoes: 6 },
    { mes: "Jun", mesAno: "2024-06", notaMedia: 8.9, habilidadesCount: 4, engajamento: 5, desenvolvimentoScore: 8, totalAvaliacoes: 5 },
  ];

  const handleJovemChange = (jovemId: string) => {
    const jovem = jovensEmpresa.find(j => j.id_jovem.toString() === jovemId);
    if (jovem) {
      setJovemSelecionado(jovem);
    }
  };

  const dados = avaliacaoData.length > 0 ? avaliacaoData : dadosExemplo;

  const estatisticas = dados.length > 0 ? {
    notaMediaGeral: dados.reduce((acc, item) => acc + item.notaMedia, 0) / dados.length,
    totalHabilidades: dados.reduce((acc, item) => acc + item.habilidadesCount, 0),
    engajamentoTotal: dados.reduce((acc, item) => acc + item.engajamento, 0),
    totalAvaliacoesGeral: dados.reduce((acc, item) => acc + item.totalAvaliacoes, 0),
    desenvolvimentoMedio: dados.reduce((acc, item) => acc + item.desenvolvimentoScore, 0) / dados.length,
  } : {
    notaMediaGeral: 0,
    totalHabilidades: 0,
    engajamentoTotal: 0,
    totalAvaliacoesGeral: 0,
    desenvolvimentoMedio: 0,
  };

  const getScoreTrend = (): boolean => {
    if (dados.length < 2) return true;
    const ultimaNota = dados[dados.length - 1].notaMedia;
    const penultimaNota = dados[dados.length - 2].notaMedia;
    return ultimaNota >= penultimaNota;
  };

  const calcularIdade = (dataNascimento?: string): string | number => {
    if (!dataNascimento) return "N/A";
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = nascimento.getMonth();
    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-t from-[#1A5579] to-[#2A2570] flex items-center justify-center">
        <div className="text-white text-xl">Carregando dados de avaliação...</div>
      </div>
    );
  }

  if (error && !empresaLogada) {
    return (
      <div className="min-h-screen bg-gradient-to-t from-[#1A5579] to-[#2A2570] flex items-center justify-center">
        <div className="bg-red-500/10 backdrop-blur-sm rounded-lg p-6 border border-red-400/20">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-2">Erro de Acesso</h3>
            <p className="text-red-200 mb-4">{error}</p>
            <button 
              onClick={() => window.location.href = "/login"}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
            >
              Voltar ao Login
            </button>
          </div>
        </div>
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
            {/* Header com informações da empresa */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Dashboard - {empresaLogada?.nome_empresa}
                </h1>
                <p className="text-blue-200">
                  Acompanhamento do desempenho dos jovens da sua empresa
                </p>
                {error && (
                  <p className="text-yellow-300 mt-2 text-sm">
                    ⚠️ Dados de exemplo exibidos. Verifique a conexão com o Supabase.
                  </p>
                )}
              </div>
              
              {/* Seletor de Jovem */}
              <div className="w-80">
                <label className="text-sm text-blue-200 mb-2 block">Jovem:</label>
                <Select 
                  value={jovemSelecionado?.id_jovem?.toString() || ""} 
                  onValueChange={handleJovemChange}
                  disabled={jovensEmpresa.length === 0}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <Users className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Selecionar jovem..." />
                  </SelectTrigger>
                  <SelectContent>
                    {jovensEmpresa.map((jovem) => (
                      <SelectItem key={jovem.id_jovem} value={jovem.id_jovem.toString()}>
                        {jovem.nome} - {jovem.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Info da Empresa Logada */}
            {empresaLogada && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 mb-4">
                <div className="flex items-center gap-4">
                  <Building2 className="h-8 w-8 text-blue-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">{empresaLogada.nome_empresa}</h3>
                    <p className="text-blue-200 text-sm">CNPJ: {empresaLogada.cnpj}</p>
                    <p className="text-blue-200 text-sm">Email: {empresaLogada.email_empresa}</p>
                    <p className="text-blue-200 text-sm">
                      {jovensEmpresa.length} jovem(ns) vinculado(s)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Info do Jovem Selecionado */}
            {jovemSelecionado && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {jovemSelecionado.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{jovemSelecionado.nome}</h2>
                      <p className="text-blue-200">{jovemSelecionado.email}</p>
                      <p className="text-blue-200 text-sm">
                        Idade: {calcularIdade(jovemSelecionado.data_nascimento)} anos
                      </p>
                      {jovemSelecionado.telefone && (
                        <p className="text-blue-200 text-sm">Tel: {jovemSelecionado.telefone}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-400">
                      Ativo
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm text-blue-200">Nota Média</p>
                      <div className="flex items-center gap-2">
                        <p className="text-3xl font-bold text-white">
                          {estatisticas.notaMediaGeral.toFixed(1)}
                        </p>
                        {getScoreTrend() ? (
                          <TrendingUp className="h-5 w-5 text-green-400" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mensagem quando não há jovens na empresa */}
            {empresaLogada && jovensEmpresa.length === 0 && (
              <div className="bg-yellow-500/10 backdrop-blur-sm rounded-lg p-6 border border-yellow-400/20 mb-6">
                <div className="text-center">
                  <Users className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Nenhum jovem encontrado
                  </h3>
                  <p className="text-yellow-200">
                    Não há jovens vinculados à sua empresa no momento.
                  </p>
                </div>
              </div>
            )}

            {/* Cards de Métricas - só exibe se tiver jovem selecionado */}
            {jovemSelecionado && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-200">Nota Global</CardTitle>
                    <Target className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{estatisticas.notaMediaGeral.toFixed(2)}</div>
                    <p className="text-xs text-blue-200">média geral das avaliações</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-200">Nota Recente</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dados.length > 0 ? dados[dados.length - 1].notaMedia.toFixed(2) : "0.00"}
                    </div>
                    <p className="text-xs text-blue-200">nota do mês mais recente</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-200">Feedbacks</CardTitle>
                    <Users className="h-4 w-4 text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{estatisticas.engajamentoTotal}</div>
                    <p className="text-xs text-blue-200">total de feedbacks recebidos</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-200">Avaliações</CardTitle>
                    <Award className="h-4 w-4 text-yellow-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{estatisticas.totalAvaliacoesGeral}</div>
                    <p className="text-xs text-blue-200">total de avaliações</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Carousel de Detalhes - só exibe se tiver jovem selecionado */}
            {jovemSelecionado && (
              <Carousel opts={{ align: "start", loop: true }} className="mb-6">
                <CarouselContent>
                  <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                    <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm text-center p-4">
                      <CardHeader>
                        <CardTitle className="text-xl text-gray-800">Desenvolvimento</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-purple-600">
                          {estatisticas.desenvolvimentoMedio.toFixed(1)}
                        </p>
                        <CardDescription>score de desenvolvimento médio</CardDescription>
                      </CardContent>
                    </Card>
                  </CarouselItem>

                  <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                    <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm text-center p-4">
                      <CardHeader>
                        <CardTitle className="text-xl text-gray-800">Habilidades</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-orange-600">
                          {estatisticas.totalHabilidades}
                        </p>
                        <CardDescription>habilidades desenvolvidas</CardDescription>
                      </CardContent>
                    </Card>
                  </CarouselItem>

                  <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                    <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm text-center p-4">
                      <CardHeader>
                        <CardTitle className="text-xl text-gray-800">Notas por Mês</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {dados.length > 0 ? (
                            dados.map((item) => (
                              <div key={item.mesAno} className="flex justify-between text-sm">
                                <strong>{item.mes}:</strong> 
                                <span className="text-blue-600">{item.notaMedia.toFixed(2)}</span>
                              </div>
                            ))
                          ) : (
                            <p>Nenhuma nota disponível</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            )}

            {/* Gráficos - só exibe se tiver jovem selecionado */}
            {jovemSelecionado && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de Evolução da Nota */}
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
                        <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.1)" />
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
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Line
                          type="linear"
                          dataKey="notaMedia"
                          stroke="#3b82f6"
                          name="Nota Média"
                          strokeWidth={3}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Gráfico de Engajamento */}
                <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm p-4">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-900">Engajamento e Desenvolvimento</CardTitle>
                    <CardDescription>Feedbacks e score de desenvolvimento mensal</CardDescription>
                  </CardHeader>
                  <CardContent style={{ height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={dados}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                        <XAxis
                          dataKey="mes"
                          tick={{ fill: "#374151", fontSize: 12 }}
                          axisLine={{ stroke: "#9ca3af" }}
                          tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <YAxis
                          tick={{ fill: "#374151", fontSize: 12 }}
                          axisLine={{ stroke: "#9ca3af" }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Bar 
                          dataKey="engajamento" 
                          fill="#10b981" 
                          name="Feedbacks"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                          dataKey="desenvolvimentoScore" 
                          fill="#8b5cf6" 
                          name="Desenvolvimento"
                          radius={[2, 2, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}