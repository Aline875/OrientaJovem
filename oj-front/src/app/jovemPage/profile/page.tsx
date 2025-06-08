"use client";

import { useDadosUsuario } from "@/hooks/useDadosUsuario";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import AppSidebar from "@/components/Sidebar";
import { Linkedin, Github } from "lucide-react";

type DadosJovem = {
  nome: string;
  email?: string;
  cpf?: string;
  projeto?: {
    nome_projeto: string;
  };
  tutor?: {
    nome_tutor: string;
  };
  nome_tutor?: string;
  nome_projeto?: string;
};

// Função auxiliar para extrair dados independente da estrutura
function extrairDadosUsuario(usuario: unknown): DadosJovem | null {
  if (!usuario || typeof usuario !== "object") {
    return null;
  }

  const usuarioObj = usuario as Record<string, unknown>;

  // Se já tem a estrutura esperada
  if (
    usuarioObj.dados &&
    typeof usuarioObj.dados === "object" &&
    usuarioObj.dados !== null
  ) {
    const dados = usuarioObj.dados as Record<string, unknown>;
    if (typeof dados.nome === "string") {
      return dados as DadosJovem;
    }
  }

  // Se os dados estão diretamente no objeto usuario
  if (typeof usuarioObj.nome === "string") {
    return usuarioObj as DadosJovem;
  }

  // Se está dentro de outra propriedade
  if (
    usuarioObj.user &&
    typeof usuarioObj.user === "object" &&
    usuarioObj.user !== null
  ) {
    const user = usuarioObj.user as Record<string, unknown>;
    if (typeof user.nome === "string") {
      return user as DadosJovem;
    }
  }

  return null;
}

export default function PerfilJovem() {
  const { usuario, carregando, erro } = useDadosUsuario();

  if (carregando)
    return (
      <p className="text-center mt-10 text-gray-600">Carregando dados...</p>
    );

  if (erro)
    return <p className="text-center mt-10 text-red-500">Erro: {erro}</p>;

  const dados = extrairDadosUsuario(usuario);

  if (!dados || !dados.nome) {
    console.log("Estrutura do usuario:", usuario);
    return (
      <p className="text-center mt-10 text-yellow-600">
        Dados do usuário não encontrados. Verifique o console para mais
        detalhes.
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-t from-[#1A5579] to-[#2A2570] flex flex-col">
      <Header />
      <div className="flex flex-1">
        <AppSidebar />
        <main className="flex-1 px-6 py-10 text-white mt-18">
          <div className="max-w-5xl mx-auto space-y-6">
            <Card className="rounded-3xl bg-[#64748b]/30 backdrop-blur-md p-6 shadow-lg">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-32 h-32 rounded-full border-4 border-white flex items-center justify-center text-4xl font-bold bg-white text-gray-800">
                  {dados.nome?.charAt(0).toUpperCase() || "?"}
                </div>

                <div className="space-y-2">
                  <p className="text-lg">
                    <span className="font-semibold">Nome</span> -{" "}
                    {dados.nome || "Não informado"}
                  </p>
                  <p className="text-lg">
                    <span className="font-semibold">Tutor</span>
                    {dados.tutor?.nome_tutor || dados.nome_tutor
                      ? ` - ${dados.tutor?.nome_tutor || dados.nome_tutor}`
                      : " - Nenhum"}
                  </p>
                  <p className="text-lg">
                    <span className="font-semibold">Projeto atual</span>
                    {dados.projeto?.nome_projeto || dados.nome_projeto
                      ? ` - ${dados.projeto?.nome_projeto || dados.nome_projeto}`
                      : " - Nenhum"}
                  </p>
                </div>
              </div>
            </Card>

            {/* Redes sociais */}
            <div className="flex items-center gap-4 justify-center">
              <a href="#" className="text-white hover:text-blue-400 text-xl">
                <Linkedin />
              </a>
              <a href="#" className="text-white hover:text-gray-300 text-xl">
                <Github />
              </a>
            </div>

            {/* Botões rápidos */}
            <div className="flex flex-wrap justify-center gap-4">
              {["Habilidades", "Ranking", "Projetos"].map((item) => (
                <button
                  key={item}
                  className="bg-[#94a3b8]/30 text-white px-4 py-2 rounded-full hover:bg-white hover:text-gray-900 transition"
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Informações do currículo */}
            <Card className="rounded-3xl bg-[#64748b]/30 backdrop-blur-md p-6 shadow-lg">
              <h2 className="text-lg font-semibold mb-2">
                Informações do currículo
              </h2>
              <p>Email: {dados.email || "Não informado"}</p>
              <p>CPF: {dados.cpf || "Não informado"}</p>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
