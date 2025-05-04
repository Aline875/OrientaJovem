"use client";
import Link from "next/link";
import Header from "@/components/Header";
import { AppSidebar } from "@/components/Sidebar";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-t from-[#1A5579] to-[#2A2570]">
      <Header />
      <AppSidebar/>
      <main className="w-full max-w-6xl flex flex-col items-center justify-center space-y-8 mt-20">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl p-8 flex flex-col items-center bg-opacity-50 backdrop-blur-lg">
          <h1 className="text-3xl font-bold text-center text-[#2A2570]">Informações Gerais</h1>
          <p className="text-center text-[#1A5579] mt-4">Aqui vão as informações gerais sobre o projeto ou o sistema.</p>
        </div>
        <div className="w-full flex justify-center space-x-4">
          <div className="w-1/3 bg-white bg-opacity-50 backdrop-blur-lg rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-[#2A2570] text-center">Perfil</h2>
            <p className="text-[#1A5579] mt-2 text-center">Preencha suas informações de perfil.</p>
            <Link href="/perfil" className="block text-center text-[#5E52FF] mt-4">Ir para o Perfil</Link>
          </div>
          <div className="w-1/3 bg-white bg-opacity-50 backdrop-blur-lg rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-[#2A2570] text-center">Desempenho</h2>
            <p className="text-[#1A5579] mt-2 text-center">Veja seu nível de desempenho baseado em feedbacks.</p>
            <Link href="/desempenho" className="block text-center text-[#5E52FF] mt-4">Ver Desempenho</Link>
          </div>
          <div className="w-1/3 bg-white bg-opacity-50 backdrop-blur-lg rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-[#2A2570] text-center">Projetos</h2>
            <p className="text-[#1A5579] mt-2 text-center">Confira seus projetos em andamento.</p>
            <Link href="/projetos" className="block text-center text-[#5E52FF] mt-4">Ir para Projetos</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
