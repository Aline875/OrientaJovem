"use client"

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <main className="flex flex-col md:flex-row w-full h-full min-h-screen">
        {/* Lado esquerdo: Logo */}
        <div className="w-full md:w-1/2 bg-[#E8E8E7] flex items-center justify-center p-10">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#D9D9D9] to-[#5E52FF] bg-clip-text text-transparent text-center">
            OrientaJovem
          </h1>
        </div>

        {/* Lado direito: Formulário com gradiente vertical (bottom to top) */}
        <div className="w-full md:w-1/2 bg-gradient-to-t from-[#1A5579] to-[#2A2570] flex items-center justify-center p-10">
          <form className="w-full max-w-md flex flex-col gap-6 text-white items-center">
            <h2 className="text-2xl font-semibold text-center">Login</h2>

            <div className="w-full">
              <Label htmlFor="email" className="block mb-1 text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="text"
                placeholder="exemplo@gmail.com"
                className="w-full px-3 py-2 rounded-md bg-[#D9D9D9] text-black placeholder:text-gray-700 shadow-md"
              />
            </div>

            <div className="w-full">
              <Label htmlFor="password" className="block mb-1 text-sm font-medium">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                className="w-full px-3 py-2 rounded-md bg-[#D9D9D9] text-black placeholder:text-gray-700 shadow-md"
              />
            </div>

            <Button
              type="submit"
              className="w-fit bg-[#D9D9D9] text-[#323536] px-6 py-2 shadow-md"
            >
              Entrar
            </Button>

            <div className="flex flex-col gap-1 text-sm mt-2 text-center">
              <span className="text-white underline cursor-pointer">
                Esqueceu a senha?
              </span>
              <Link href="/cadastro" className="text-white underline">
                Ainda não está cadastrado?
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
