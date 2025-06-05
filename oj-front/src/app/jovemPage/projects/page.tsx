"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import AppSidebar from "@/components/Sidebar";
import {
  User,
  Building2,
  BookOpen,
  CheckCircle,
} from "lucide-react";

// Interfaces para tipagem
interface Empresa {
  id_empresa: number;
  nome_empresa: string;
  email_empresa: string;
  cnpj: string;
}

interface Tutor {
  id_tutor: number;
  nome_tutor: string;
  email_tutor: string;
}

interface ProjetoAtual {
  id_projeto: number;
  nome_projeto: string;
  descricao: string;
  avaliacao_jovem?: string | null;
  empresa: Empresa;
  tutor?: Tutor | null;
}

interface UsuarioJovem {
  id: number;
  nome: string;
  email: string;
  tipo: string;
}

export default function ProjetosJovem() {
  const [projetoAtual, setProjetoAtual] = useState<ProjetoAtual | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<UsuarioJovem | null>(null);

  useEffect(() => {
    inicializarDados();
  }, []);

  async function inicializarDados() {
    try {
      setLoading(true);
      setError(null);

      // Verificar sessão do usuário
      const sessao = localStorage.getItem("usuario_sessao");
      if (!sessao) {
        throw new Error("Nenhum usuário logado.");
      }

      const usuarioLogado = JSON.parse(sessao);
      if (usuarioLogado.tipo !== "jovem") {
        throw new Error("Usuário logado não é um jovem.");
      }

      setUsuario(usuarioLogado);

      // Buscar apenas o projeto atual
      await buscarProjetoAtual(usuarioLogado.id);
    } catch (err) {
      console.error("Erro ao inicializar dados:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  async function buscarProjetoAtual(jovemId: number) {
    try {
      console.log("Buscando projeto atual para jovem ID:", jovemId);

      // Buscar o jovem e seu projeto atual através da chave estrangeira
      const { data: jovemData, error: jovemError } = await supabase
        .from("jovem")
        .select(
          `
          id_jovem,
          nome,
          email,
          id_projeto,
          projeto:id_projeto (
            id_projeto,
            nome_projeto,
            descricao,
            avaliacao_jovem,
            empresa:id_empresa (
              id_empresa,
              nome_empresa,
              email_empresa,
              cnpj
            ),
            tutor:id_tutor (
              id_tutor,
              nome_tutor,
              email_tutor
            )
          )
        `
        )
        .eq("id_jovem", jovemId)
        .single();

      if (jovemError) {
        console.error("Erro ao buscar dados do jovem:", jovemError);
        throw new Error("Erro ao buscar dados do jovem");
      }

      console.log("Dados do jovem:", jovemData);

      // Se o jovem tem um projeto atual
      if (jovemData?.id_projeto && jovemData.projeto) {
        const projeto = Array.isArray(jovemData.projeto) 
          ? jovemData.projeto[0] 
          : jovemData.projeto;

        if (projeto) {
          setProjetoAtual({
            id_projeto: projeto.id_projeto,
            nome_projeto: projeto.nome_projeto,
            descricao: projeto.descricao,
            avaliacao_jovem: projeto.avaliacao_jovem,
            empresa: Array.isArray(projeto.empresa)
              ? projeto.empresa[0]
              : projeto.empresa,
            tutor:
              Array.isArray(projeto.tutor) && projeto.tutor.length > 0
                ? projeto.tutor[0]
                : null,
          });
        } else {
          setProjetoAtual(null);
        }
      } else {
        // Jovem não tem projeto atual
        setProjetoAtual(null);
      }
    } catch (err) {
      console.error("Erro ao buscar projeto atual:", err);
      setError("Erro ao carregar projeto atual");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-t from-[#1A5579] to-[#2A2570] text-white">
        <Header />
        <main className="flex">
          <AppSidebar />
          <section className="flex-1 px-6 py-10 flex justify-center items-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-xl">Carregando seu projeto...</p>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-t from-[#1A5579] to-[#2A2570] text-white">
        <Header />
        <main className="flex">
          <AppSidebar />
          <section className="flex-1 px-6 py-10">
            <h1 className="text-3xl font-bold mb-6">Meu Projeto</h1>
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
              <p className="text-red-300">Erro: {error}</p>
              <button
                onClick={inicializarDados}
                className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-t from-[#1A5579] to-[#2A2570] text-white">
      <Header />
      <main className="flex">
        <AppSidebar />
        <section className="mt-10 flex-1 px-6 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Meu Projeto</h1>
            {usuario && (
              <p className="text-gray-300">
                Olá, <span className="font-semibold">{usuario.nome}</span>! Aqui
                você pode ver detalhes do seu projeto atual.
              </p>
            )}
          </div>

          {/* Projeto Atual */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              Projeto Atual
            </h2>

            {projetoAtual ? (
              <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-400/30 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-green-100 mb-2">
                      {projetoAtual.nome_projeto}
                    </h3>
                    <p className="text-sm text-gray-300 mb-1">
                      ID do Projeto: {projetoAtual.id_projeto}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Ativo</span>
                  </div>
                </div>

                <p className="text-gray-200 mb-6 leading-relaxed text-lg">
                  {projetoAtual.descricao}
                </p>

                {/* Empresa e Tutor */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className="w-5 h-5 text-blue-400" />
                      <span className="font-medium text-blue-200">Empresa</span>
                    </div>
                    <p className="text-white font-semibold text-lg">
                      {projetoAtual.empresa.nome_empresa}
                    </p>
                    <p className="text-gray-300 text-sm">
                      {projetoAtual.empresa.email_empresa}
                    </p>
                    <p className="text-gray-400 text-xs">
                      CNPJ: {projetoAtual.empresa.cnpj}
                    </p>
                  </div>

                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-5 h-5 text-purple-400" />
                      <span className="font-medium text-purple-200">Tutor</span>
                    </div>
                    {projetoAtual.tutor ? (
                      <>
                        <p className="text-white font-semibold text-lg">
                          {projetoAtual.tutor.nome_tutor}
                        </p>
                        <p className="text-gray-300 text-sm">
                          {projetoAtual.tutor.email_tutor}
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-400 italic">
                        Nenhum tutor atribuído
                      </p>
                    )}
                  </div>
                </div>

                {/* Avaliação do Jovem */}
                {projetoAtual.avaliacao_jovem && (
                  <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-200 mb-2">
                      Sua Avaliação:
                    </h4>
                    <p className="text-yellow-100 italic">
                      {projetoAtual.avaliacao_jovem}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-500/20 border border-gray-400/30 rounded-lg p-8 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-2xl text-gray-300 mb-2">
                  Nenhum projeto ativo
                </p>
                <p className="text-gray-400 text-lg">
                  Você não está participando de nenhum projeto no momento.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}