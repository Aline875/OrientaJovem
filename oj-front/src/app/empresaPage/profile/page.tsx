"use client";

import { useDadosUsuario } from "@/hooks/useDadosUsuario";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import AppSidebar from "@/components/Sidebar";
import { Linkedin, Github } from "lucide-react";

type DadosEmpresa = {
  id_empresa: number;
  cnpj: string;
  nome_empresa: string;
  email_empresa: string;
  list_tutor?: string;
  list_jovens?: string;
  id_projeto?: number;
  projeto?: {
    nome_projeto: string;
  };
};

// Função auxiliar para extrair dados independente da estrutura
function extrairDadosEmpresa(usuario: unknown): DadosEmpresa | null {
  if (!usuario || typeof usuario !== "object") return null;

  const obj = usuario as Record<string, unknown>;

  // Caso os dados estejam em 'dados'
  if (obj.dados && typeof obj.dados === "object") {
    const dados = obj.dados as Record<string, unknown>;
    if (typeof dados.nome_empresa === "string") {
      return dados as DadosEmpresa;
    }
  }

  // Dados diretamente no objeto
  if (typeof obj.nome_empresa === "string") {
    return obj as DadosEmpresa;
  }

  return null;
}

export default function PerfilEmpresa() {
  const { usuario, carregando, erro } = useDadosUsuario();

  if (carregando)
    return (
      <p className="text-center mt-10 text-blue-200">Carregando dados...</p>
    );

  if (erro)
    return <p className="text-center mt-10 text-red-400">Erro: {erro}</p>;

  const dados = extrairDadosEmpresa(usuario);

  if (!dados || !dados.nome_empresa) {
    console.log("Estrutura do usuário:", usuario);
    return (
      <p className="text-center mt-10 text-yellow-400">
        Dados da empresa não encontrados. Verifique o console para mais
        detalhes.
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-t from-[#1A5579] to-[#2A2570] flex flex-col">
      <Header />
      <div className="flex flex-1">
        <AppSidebar />
        <main className="flex-1 px-6 py-10 text-blue-200 mt-18">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Card principal */}
            <Card className="rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 p-6 shadow-lg">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-32 h-32 rounded-full border-4 border-white/30 flex items-center justify-center text-4xl font-bold bg-white/20 backdrop-blur-sm text-blue-200">
                  {dados.nome_empresa?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="space-y-2">
                  <p className="text-lg text-blue-200">
                    <span className="font-semibold">Empresa</span> -{" "}
                    {dados.nome_empresa || "Não informado"}
                  </p>
                  <p className="text-lg text-blue-200">
                    <span className="font-semibold">CNPJ</span> -{" "}
                    {dados.cnpj || "Não informado"}
                  </p>
                </div>
              </div>
            </Card>

            {/* Redes sociais */}
            <div className="flex items-center gap-4 justify-center">
              <a href="#" className="text-blue-200 hover:text-blue-300 text-xl transition-colors duration-300">
                <Linkedin />
              </a>
              <a href="#" className="text-blue-200 hover:text-blue-300 text-xl transition-colors duration-300">
                <Github />
              </a>
            </div>

            {/* Botões rápidos */}
            <div className="flex flex-wrap justify-center gap-4">
              {["Projetos", "Ranking", "Colaboradores"].map((item) => (
                <button
                  key={item}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 text-blue-200 px-4 py-2 rounded-full hover:bg-white/20 transition-all duration-300"
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Informações adicionais */}
            <Card className="rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 p-6 shadow-lg">
              <h2 className="text-lg font-semibold mb-2 text-blue-200">
                Informações de Contato
              </h2>
              <p className="text-blue-200">Email Corporativo: {dados.email_empresa || "Não informado"}</p>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}