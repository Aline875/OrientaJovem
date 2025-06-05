"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });

  const [mensagemErro, setMensagemErro] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMensagemErro("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { email, senha } = formData;

    if (!email || !senha) {
      setMensagemErro("Preencha todos os campos obrigatórios.");
      return;
    }

    // Tenta autenticar como jovem
    const { data: jovem, error: errorJovem } = await supabase
      .from("jovem")
      .select("*")
      .eq("email", email)
      .eq("senha", senha)
      .maybeSingle();

    if (!errorJovem && jovem) {
      const dadosSessao = {
        id: jovem.id_jovem,
        email: jovem.email,
        nome: jovem.nome,
        tipo: "jovem" as const,
        timestamp: Date.now(),
      };

      localStorage.setItem("usuario_sessao", JSON.stringify(dadosSessao));
      router.push("/home");
      return;
    }

    // Tenta autenticar como empresa
    const { data: empresa, error: errorEmpresa } = await supabase
      .from("empresa")
      .select("*")
      .eq("email_empresa", email)
      .eq("senha", senha)
      .maybeSingle();

    if (!errorEmpresa && empresa) {
      const dadosSessao = {
        id: empresa.id_empresa, // ou empresa.id, se for assim no seu banco
        email: empresa.email_empresa,
        nome: empresa.nome_empresa,
        cnpj: empresa.cnpj,
        tipo: "empresa" as const,
        timestamp: Date.now(),
      };

      localStorage.setItem("usuario_sessao", JSON.stringify(dadosSessao));
      router.push("/home");
      return;
    }

    setMensagemErro("Email ou senha inválidos.");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <main className="flex flex-col md:flex-row w-full h-full min-h-screen">
        <div className="w-full md:w-1/2 bg-[#E8E8E7] flex items-center justify-center p-10">
          <h1 className="text-4xl font-semibold bg-gradient-to-r from-[#D9D9D9] to-[#5E52FF] bg-clip-text text-transparent text-center">
            OrientaJovem
          </h1>
        </div>

        <div className="w-full md:w-1/2 bg-gradient-to-t from-[#1A5579] to-[#2A2570] flex items-center justify-center p-10">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md flex flex-col gap-6 text-white items-center"
          >
            <h2 className="text-2xl font-semibold text-center">Entrar</h2>

            <p className="text-sm text-center text-gray-300">
              Acesso para jovens e empresas
            </p>

            <div className="w-full">
              <Label htmlFor="email" className="block mb-1 text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="exemplo@gmail.com"
                className="w-full px-3 py-2 rounded-md bg-[#D9D9D9] text-black placeholder:text-gray-700 shadow-md"
              />
            </div>

            <div className="w-full">
              <Label htmlFor="senha" className="block mb-1 text-sm font-medium">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="senha"
                  name="senha"
                  type={mostrarSenha ? "text" : "password"}
                  value={formData.senha}
                  onChange={handleInputChange}
                  placeholder="********"
                  className="w-full px-3 py-2 pr-10 rounded-md bg-[#D9D9D9] text-black placeholder:text-gray-700 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-black"
                  tabIndex={-1}
                >
                  {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {mensagemErro && (
              <p className="text-sm text-red-300 text-center">{mensagemErro}</p>
            )}

            <Button
              type="submit"
              className="w-fit bg-[#D9D9D9] text-[#323536] px-6 py-2 shadow-md hover:bg-[#C9C9C9]"
            >
              Entrar
            </Button>

            <div className="flex flex-col gap-1 text-sm mt-2 text-center">
              <Link href="/cadastro" className="text-white underline">
                Não tem uma conta? Cadastre-se
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
