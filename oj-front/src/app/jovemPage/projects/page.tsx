"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import AppSidebar from "@/components/Sidebar";
import { supabase } from "@/lib/supabase";

export default function Projects() {
  const [dados, setDados] = useState([]);

  type DadosUsuario = {
    nome_projeto?: string;
    nome_empresa?: string;
    id_projeto?: string;
    email?: string;
    cpf?: string;
    descrição: string;
    avaliação_jovem: string;
    list_jovem: string;
    id_tutor: string;
    id_empresa: string;
  };

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase.from('projeto').select('*');
      if (error) {
        console.error("Erro ao buscar dados:", error);
      } else {
        setDados(data || []);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-t from-[#1A5579] to-[#2A2570] text-black">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 space-y-10">
        <AppSidebar />

        {/* Exibição dos dados (exemplo simples) */}
        <div className="text-white">
          {dados.map((item: DadosUsuario, index) => (
            <div key={index} className="mb-4">
              <p><strong>Descrição:</strong> {item.descrição}</p>
              <p><strong>Avaliação:</strong> {item.avaliação_jovem}</p>
              {/* Adicione outros campos conforme necessário */}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
