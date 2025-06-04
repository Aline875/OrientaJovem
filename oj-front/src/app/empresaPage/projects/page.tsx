"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import AppSidebar from "@/components/Sidebar";

type Tutor = {
  id_tutor: number;
  nome_tutor: string;
};

type Projeto = {
  id_projeto: number;
  nome_projeto: string;
  tutor: Tutor | null;
};

export default function ListaProjetos() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjetos();
  }, []);

  async function fetchProjetos() {
    try {
      setLoading(true);
      const sessao = localStorage.getItem("usuario_sessao");
      if (!sessao) throw new Error("Nenhum usuário logado.");

      const usuario = JSON.parse(sessao);
      if (usuario.tipo !== "empresa") throw new Error("Usuário inválido.");

      const { data, error: supabaseError } = await supabase
        .from("projeto")
        .select(`
          id_projeto,
          nome_projeto,
          tutor:id_tutor (
            id_tutor,
            nome_tutor
          )
        `)
        .eq("id_empresa", usuario.id);

      if (supabaseError) throw supabaseError;

      const projetosFormatados: Projeto[] = (data ?? []).map((item: {
        id_projeto: number;
        nome_projeto: string;
        tutor: Tutor | Tutor[] | null;
      }) => ({
        id_projeto: item.id_projeto,
        nome_projeto: item.nome_projeto,
        tutor: Array.isArray(item.tutor) ? item.tutor[0] : item.tutor,
      }));

      setProjetos(projetosFormatados);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar projetos.");
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
          <h1 className="text-3xl font-bold mb-6">Projetos</h1>
          {loading ? (
            <p>Carregando...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : projetos.length === 0 ? (
            <p>Nenhum projeto encontrado.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projetos.map((projeto) => (
             <Link
                key={projeto.id_projeto}
                href={`/empresaPage/projects/${projeto.id_projeto}`}
                className="bg-white text-black p-6 rounded-lg shadow hover:bg-gray-100 transition block"
              >

                  <h2 className="font-semibold text-xl mb-1">
                    {projeto.nome_projeto}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Tutor: {projeto.tutor?.nome_tutor || "Não definido"}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
