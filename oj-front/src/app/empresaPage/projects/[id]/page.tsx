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
    <div className="mt-16 min-h-screen bg-gradient-to-t from-[#1A5579] to-[#2A2570] text-white">
      <Header />
      <main className="flex">
        <AppSidebar />
        <section className="flex-1 px-6 py-10">
          <button
            onClick={() => router.back()}
            className="mb-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
          >
            <ArrowLeft />
          </button>

          {loading ? (
            <p>Carregando detalhes...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : projeto ? (
            <div className="bg-white text-black p-6 rounded-lg shadow grid gap-4">
              <h1 className="text-3xl font-bold">{projeto.nome_projeto}</h1>
              <p>
                <strong>Descrição:</strong> {projeto.descricao}
              </p>
              <p>
                <strong>Tutor:</strong>{" "}
                {projeto.tutor?.nome_tutor || "Não definido"} (
                {projeto.tutor?.email_tutor || "sem email"})
              </p>
              <p>
                <strong>Avaliação do Jovem:</strong>{" "}
                {projeto.avaliacao_jovem || "N/A"}
              </p>
              <p>
                <strong>Lista de Jovens:</strong> {projeto.list_jovem || "N/A"}
              </p>
            </div>
          ) : (
            <p>Projeto não encontrado.</p>
          )}
        </section>
      </main>
    </div>
  );
}
