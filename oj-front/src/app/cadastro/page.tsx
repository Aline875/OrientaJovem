"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Cadastro() {
  const [tipoUsuario, setTipoUsuario] = useState<"jovem" | "empresa">("jovem");

  const [formDataJovem, setFormDataJovem] = useState({
    nome: "",
    email: "",
    cpf: "",
    senha: "",
    confirmarSenha: "",
  });

  const [formDataEmpresa, setFormDataEmpresa] = useState({
    nome_empresa: "",
    cnpj: "",
    email_empresa: "",
    senha: "",
    confirmarSenha: "",
  });

  const [mensagemErro, setMensagemErro] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  const handleInputChangeJovem = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormDataJovem({ ...formDataJovem, [name]: value });
    setMensagemErro("");
    setMensagemSucesso("");
  };

  const handleInputChangeEmpresa = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormDataEmpresa({ ...formDataEmpresa, [name]: value });
    setMensagemErro("");
    setMensagemSucesso("");
  };

  const handleSubmitJovem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { nome, email, cpf, senha, confirmarSenha } = formDataJovem;

    if (!nome || !email || !cpf || !senha || !confirmarSenha) {
      setMensagemErro("Preencha todos os campos obrigatórios.");
      return;
    }

    if (senha !== confirmarSenha) {
      setMensagemErro("As senhas não coincidem.");
      return;
    }

    const { error } = await supabase
      .from("jovem")
      .insert([{ nome, email, cpf, senha }]);

    if (error) {
      setMensagemErro("Erro ao cadastrar. Tente novamente.");
      return;
    }

    setFormDataJovem({
      nome: "",
      email: "",
      cpf: "",
      senha: "",
      confirmarSenha: "",
    });
    setMensagemSucesso("Cadastro realizado com sucesso!");
  };

  const handleSubmitEmpresa = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { nome_empresa, cnpj, email_empresa, senha, confirmarSenha } =
      formDataEmpresa;

    if (!nome_empresa || !cnpj || !email_empresa || !senha || !confirmarSenha) {
      setMensagemErro("Preencha todos os campos obrigatórios.");
      return;
    }

    if (senha !== confirmarSenha) {
      setMensagemErro("As senhas não coincidem.");
      return;
    }

    const { error } = await supabase.from("empresa").insert([
      {
        nome_empresa,
        cnpj,
        email_empresa,
        senha,
      },
    ]);

    if (error) {
      setMensagemErro("Erro ao cadastrar empresa. Tente novamente.");
      return;
    }

    setFormDataEmpresa({
      nome_empresa: "",
      cnpj: "",
      email_empresa: "",
      senha: "",
      confirmarSenha: "",
    });
    setMensagemSucesso("Empresa cadastrada com sucesso!");
  };

  const alternarTipoUsuario = (tipo: "jovem" | "empresa") => {
    setTipoUsuario(tipo);
    setMensagemErro("");
    setMensagemSucesso("");
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
          <div className="w-full max-w-md flex flex-col gap-6 text-white items-center">
            {/* Botões de alternância */}
            <div className="flex w-full bg-white/10 rounded-lg p-1">
              <button
                onClick={() => alternarTipoUsuario("jovem")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  tipoUsuario === "jovem"
                    ? "bg-white text-[#2A2570] shadow-md"
                    : "text-white hover:bg-white/10"
                }`}
              >
                Cadastro Jovem
              </button>
              <button
                onClick={() => alternarTipoUsuario("empresa")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  tipoUsuario === "empresa"
                    ? "bg-white text-[#2A2570] shadow-md"
                    : "text-white hover:bg-white/10"
                }`}
              >
                Cadastro Empresa
              </button>
            </div>

            {/* Formulário Jovem */}
            {tipoUsuario === "jovem" && (
              <form
                onSubmit={handleSubmitJovem}
                className="w-full flex flex-col gap-6 items-center"
              >
                <h2 className="text-2xl font-semibold text-center">
                  Cadastro Jovem
                </h2>

                <div className="w-full">
                  <Label
                    htmlFor="nome"
                    className="block mb-1 text-sm font-medium"
                  >
                    Nome
                  </Label>
                  <Input
                    id="nome"
                    name="nome"
                    type="text"
                    value={formDataJovem.nome}
                    onChange={handleInputChangeJovem}
                    placeholder="Seu nome completo"
                    className="w-full px-3 py-2 rounded-md bg-[#D9D9D9] text-black placeholder:text-gray-700 shadow-md"
                  />
                </div>

                <div className="w-full">
                  <Label
                    htmlFor="email"
                    className="block mb-1 text-sm font-medium"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formDataJovem.email}
                    onChange={handleInputChangeJovem}
                    placeholder="exemplo@gmail.com"
                    className="w-full px-3 py-2 rounded-md bg-[#D9D9D9] text-black placeholder:text-gray-700 shadow-md"
                  />
                </div>

                <div className="w-full">
                  <Label
                    htmlFor="cpf"
                    className="block mb-1 text-sm font-medium"
                  >
                    CPF
                  </Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    type="text"
                    value={formDataJovem.cpf}
                    onChange={handleInputChangeJovem}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 rounded-md bg-[#D9D9D9] text-black placeholder:text-gray-700 shadow-md"
                  />
                </div>

                <div className="w-full">
                  <Label
                    htmlFor="senha"
                    className="block mb-1 text-sm font-medium"
                  >
                    Senha
                  </Label>
                  <Input
                    id="senha"
                    name="senha"
                    type="password"
                    value={formDataJovem.senha}
                    onChange={handleInputChangeJovem}
                    placeholder="********"
                    className="w-full px-3 py-2 rounded-md bg-[#D9D9D9] text-black placeholder:text-gray-700 shadow-md"
                  />
                </div>

                <div className="w-full">
                  <Label
                    htmlFor="confirmarSenha"
                    className="block mb-1 text-sm font-medium"
                  >
                    Confirmar Senha
                  </Label>
                  <Input
                    id="confirmarSenha"
                    name="confirmarSenha"
                    type="password"
                    value={formDataJovem.confirmarSenha}
                    onChange={handleInputChangeJovem}
                    placeholder="********"
                    className="w-full px-3 py-2 rounded-md bg-[#D9D9D9] text-black placeholder:text-gray-700 shadow-md"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-fit bg-[#D9D9D9] text-[#323536] px-6 py-2 shadow-md hover:bg-[#C9C9C9]"
                >
                  Cadastrar Jovem
                </Button>
              </form>
            )}

            {/* Formulário Empresa */}
            {tipoUsuario === "empresa" && (
              <form
                onSubmit={handleSubmitEmpresa}
                className="w-full flex flex-col gap-6 items-center"
              >
                <h2 className="text-2xl font-semibold text-center">
                  Cadastro Empresa
                </h2>

                <div className="w-full">
                  <Label
                    htmlFor="nome_empresa"
                    className="block mb-1 text-sm font-medium"
                  >
                    Nome da Empresa
                  </Label>
                  <Input
                    id="nome_empresa"
                    name="nome_empresa"
                    type="text"
                    value={formDataEmpresa.nome_empresa}
                    onChange={handleInputChangeEmpresa}
                    placeholder="Nome da sua empresa"
                    className="w-full px-3 py-2 rounded-md bg-[#D9D9D9] text-black placeholder:text-gray-700 shadow-md"
                  />
                </div>

                <div className="w-full">
                  <Label
                    htmlFor="cnpj"
                    className="block mb-1 text-sm font-medium"
                  >
                    CNPJ
                  </Label>
                  <Input
                    id="cnpj"
                    name="cnpj"
                    type="text"
                    value={formDataEmpresa.cnpj}
                    onChange={handleInputChangeEmpresa}
                    placeholder="00.000.000/0000-00"
                    className="w-full px-3 py-2 rounded-md bg-[#D9D9D9] text-black placeholder:text-gray-700 shadow-md"
                  />
                </div>

                <div className="w-full">
                  <Label
                    htmlFor="email_empresa"
                    className="block mb-1 text-sm font-medium"
                  >
                    Email
                  </Label>
                  <Input
                    id="email_empresa"
                    name="email_empresa"
                    type="email_empresa"
                    value={formDataEmpresa.email_empresa}
                    onChange={handleInputChangeEmpresa}
                    placeholder="contato@empresa.com"
                    className="w-full px-3 py-2 rounded-md bg-[#D9D9D9] text-black placeholder:text-gray-700 shadow-md"
                  />
                </div>

                <div className="w-full">
                  <Label
                    htmlFor="senhaEmpresa"
                    className="block mb-1 text-sm font-medium"
                  >
                    Senha
                  </Label>
                  <Input
                    id="senhaEmpresa"
                    name="senha"
                    type="password"
                    value={formDataEmpresa.senha}
                    onChange={handleInputChangeEmpresa}
                    placeholder="********"
                    className="w-full px-3 py-2 rounded-md bg-[#D9D9D9] text-black placeholder:text-gray-700 shadow-md"
                  />
                </div>

                <div className="w-full">
                  <Label
                    htmlFor="confirmarSenhaEmpresa"
                    className="block mb-1 text-sm font-medium"
                  >
                    Confirmar Senha
                  </Label>
                  <Input
                    id="confirmarSenhaEmpresa"
                    name="confirmarSenha"
                    type="password"
                    value={formDataEmpresa.confirmarSenha}
                    onChange={handleInputChangeEmpresa}
                    placeholder="********"
                    className="w-full px-3 py-2 rounded-md bg-[#D9D9D9] text-black placeholder:text-gray-700 shadow-md"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-fit bg-[#D9D9D9] text-[#323536] px-6 py-2 shadow-md hover:bg-[#C9C9C9]"
                >
                  Cadastrar Empresa
                </Button>
              </form>
            )}

            {/* Mensagens de erro e sucesso */}
            {mensagemErro && (
              <p className="text-sm text-red-300 text-center">{mensagemErro}</p>
            )}

            {mensagemSucesso && (
              <p className="text-sm text-green-300 text-center">
                {mensagemSucesso}
              </p>
            )}

            <div className="flex flex-col gap-1 text-sm mt-2 text-center">
              <Link href="/" className="text-white underline">
                Já possui uma conta? Entrar
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
