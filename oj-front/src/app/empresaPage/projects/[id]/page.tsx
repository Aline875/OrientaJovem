"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import AppSidebar from "@/components/Sidebar";
import { ArrowLeft } from "lucide-react";

type Tutor = {
  nome_tutor: string;
  email_tutor: string;
};

type Projeto = {
  nome_projeto: string;
  descricao: string;
  avaliacao_jovem?: string | null;
  list_jovem?: string | null;
  tutor?: Tutor | null;
};

export default function ProjetoDetalhes() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchProjetoDetalhes();
  }, [id]);

  async function fetchProjetoDetalhes() {
    try {
      const { data, error: supabaseError } = await supabase
        .from("projeto")
        .select(
          `
          nome_projeto,
          descricao,
          avaliacao_jovem,
          list_jovem,
          tutor:id_tutor (
            nome_tutor,
            email_tutor
          )
        `
        )
        .eq("id_projeto", id)
        .single();

      if (supabaseError) throw supabaseError;

      setProjeto({
        nome_projeto: data.nome_projeto,
        descricao: data.descricao,
        avaliacao_jovem: data.avaliacao_jovem,
        list_jovem: data.list_jovem,
        tutor: Array.isArray(data.tutor) ? data.tutor[0] : data.tutor,
      });
    } catch {
      // removi o parâmetro err porque não é usado
      setError("Erro ao carregar detalhes do projeto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-16 min-h-screen bg-gradient-to-t from-[#1A5579] to-[#2A2570] text-blue-200">
      <Header />
      <main className="flex">
        <AppSidebar />
        <section className="flex-1 px-6 py-10">
          <button
            onClick={() => router.back()}
            className="mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-blue-200 rounded hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          
          {loading ? (
            <p className="text-blue-200">Carregando detalhes...</p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : projeto ? (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 text-blue-200 p-6 rounded-lg shadow-lg grid gap-6">
              <h1 className="text-3xl font-bold text-blue-200 mb-4">{projeto.nome_projeto}</h1>
              
              <div className="space-y-4">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-blue-200 mb-2">Descrição</h2>
                  <p className="text-blue-200/90">{projeto.descricao || "Sem descrição disponível"}</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-blue-200 mb-2">Tutor Responsável</h2>
                  <p className="text-blue-200/90">
                    <span className="font-medium">Nome:</span> {projeto.tutor?.nome_tutor || "Não definido"}
                  </p>
                  <p className="text-blue-200/90">
                    <span className="font-medium">Email:</span> {projeto.tutor?.email_tutor || "Sem email"}
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-blue-200 mb-2">Avaliação do Jovem</h2>
                  <p className="text-blue-200/90">{projeto.avaliacao_jovem || "Nenhuma avaliação disponível"}</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-blue-200 mb-2">Lista de Jovens</h2>
                  <p className="text-blue-200/90">{projeto.list_jovem || "Nenhum jovem cadastrado"}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 text-blue-200 p-6 rounded-lg shadow-lg text-center">
              <p className="text-lg">Projeto não encontrado.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}