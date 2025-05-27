"use client";

import { useDadosUsuario } from "@/hooks/useDadosUsuario";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import AppSidebar from "@/components/Sidebar";
import { Linkedin, Github } from "lucide-react";

type DadosJovem = {
  nome: string;
  email: string;
  cpf: string;
  projeto?: {
    nome_projeto: string;
  };
  tutor?: {
    nome_tutor: string;
  };
};

interface UsuarioJovem {
  tipo: "jovem";
  dados: DadosJovem;
}

// Type guard melhorado para validar tipo e estrutura
function isUsuarioJovem(usuario: unknown): usuario is UsuarioJovem {
  if (
    typeof usuario === "object" &&
    usuario !== null &&
    "tipo" in usuario &&
    typeof (usuario as { tipo?: unknown }).tipo === "string" &&
    (usuario as { tipo: string }).tipo === "jovem" &&
    "dados" in usuario
  ) {
    const dados = (usuario as { dados?: unknown }).dados;
    return (
      typeof dados === "object" &&
      dados !== null &&
      typeof (dados as { nome?: unknown }).nome === "string" &&
      typeof (dados as { email?: unknown }).email === "string" &&
      typeof (dados as { cpf?: unknown }).cpf === "string"
    );
  }
  return false;
}


export default function PerfilJovem() {
  const { usuario, carregando, erro } = useDadosUsuario();

  if (carregando)
    return (
      <p className="text-center mt-10 text-gray-600">Carregando dados...</p>
    );

  if (erro)
    return <p className="text-center mt-10 text-red-500">Erro: {erro}</p>;

  if (!usuario || !isUsuarioJovem(usuario))
    return (
      <p className="text-center mt-10 text-yellow-600">Usuário inválido.</p>
    );

  const dados = usuario.dados;

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
                  {dados.nome.charAt(0).toUpperCase() || "?"}
                </div>

                <div className="space-y-2">
                  <p className="text-lg">
                    <span className="font-semibold">Nome</span> - {dados.nome}
                  </p>
                  <p className="text-lg">
                    <span className="font-semibold">Tutor</span>
                    {dados.tutor ? ` - ${dados.tutor.nome_tutor}` : " - Nenhum"}
                  </p>
                  <p className="text-lg">
                    <span className="font-semibold">Projeto atual</span>
                    {dados.projeto
                      ? ` - ${dados.projeto.nome_projeto}`
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
              <p>Email: {dados.email}</p>
              <p>CPF: {dados.cpf}</p>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
