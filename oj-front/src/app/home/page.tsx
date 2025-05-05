"use client";

import Link from "next/link";
import Header from "@/components/Header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-t from-[#1A5579] to-[#2A2570] text-black">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 space-y-10">
        
        <Card className="w-full max-w-4xl bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">Aqui vão as informações gerais sobre o projeto ou o sistema.</p>
          </CardContent>
        </Card>

        <div className="w-full max-w-6xl flex flex-col lg:flex-row justify-center items-center gap-6">
          {[{
            title: "Perfil",
            text: "Preencha suas informações de perfil.",
            link: "/perfil",
          }, {
            title: "Desempenho",
            text: "Veja seu nível de desempenho baseado em feedbacks.",
            link: "/desempenho",
          }, {
            title: "Projetos",
            text: "Confira seus projetos em andamento.",
            link: "/projetos",
          }].map(({ title, text, link }, idx) => (
            <Card
              key={idx}
              className="flex-1 min-w-[250px] bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl text-center"
            >
              <CardHeader>
                <CardTitle className="text-xl">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{text}</p>
                <Link href={link} className="block text-[#2A2570] font-medium mt-4 hover:underline">
                  Acessar {title}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
