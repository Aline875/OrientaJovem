"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import AppSidebar from "@/components/Sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

// Tipagem ajustada para refletir o retorno do Supabase
type ProjetoComTutorFromDB = {
  id_projeto: number;
  nome_projeto: string;
  descricao: string;
  avaliacao_jovem: string | null;
  list_jovem: string | null;
  id_empresa: number;
  id_tutor: number | null;
  tutor: { 
    id_tutor: number;
    nome_tutor: string; 
    email: string;
    login: string;
    cpf: number;
  }[] | null; // Supabase retorna array mesmo que tenha 1
};

interface Tutor {
  id_tutor: number;
  nome_tutor: string;
  email: string;
  login: string;
  cpf: number;
}

interface Projeto {
  id_projeto: number;
  nome_projeto: string;
  descricao: string;
  avaliacao_jovem?: string | null;
  list_jovem?: string | null;
  id_empresa: number;
  id_tutor?: number | null;
  tutor?: Tutor | null; // o que será exibido
}

interface NovoProjetoForm {
  nome_projeto: string;
  descricao: string;
  id_tutor: string;
}

export default function ProjetosDaEmpresa() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTutores, setLoadingTutores] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [salvandoProjeto, setSalvandoProjeto] = useState(false);
  const [formData, setFormData] = useState<NovoProjetoForm>({
    nome_projeto: "",
    descricao: "",
    id_tutor: "",
  });

  useEffect(() => {
    fetchProjetos();
    fetchTutores();
  }, []);

  async function fetchTutores() {
    try {
      setLoadingTutores(true);

      // Busca tutores que ainda não estão vinculados a um projeto específico
      // ou que estão disponíveis para atribuição
      const { data, error: supabaseError } = await supabase
        .from("tutor")
        .select("id_tutor, nome_tutor, email, login, cpf")
        .order("nome_tutor");

      if (supabaseError) {
        console.error("Erro ao buscar tutores:", supabaseError.message);
        return;
      }

      if (data) {
        setTutores(data);
      }
    } catch (err) {
      console.error("Erro ao buscar tutores:", err);
    } finally {
      setLoadingTutores(false);
    }
  }

  async function fetchProjetos() {
    try {
      setLoading(true);
      setError(null);

      const sessao = localStorage.getItem("usuario_sessao");
      if (!sessao) throw new Error("Nenhum usuário logado.");

      const usuario = JSON.parse(sessao);
      if (usuario.tipo !== "empresa")
        throw new Error("Usuário logado não é uma empresa.");

      const { data, error: supabaseError } = await supabase
        .from("projeto")
        .select(
          `
        id_projeto,
        nome_projeto,
        descricao,
        avaliacao_jovem,
        list_jovem,
        id_empresa,
        id_tutor,
        tutor:id_tutor (
          id_tutor,
          nome_tutor,
          email,
          login,
          cpf
        )
      `
        )
        .eq("id_empresa", usuario.id);

      if (supabaseError) {
        throw new Error(`Erro ao buscar projetos: ${supabaseError.message}`);
      }

      if (data) {
        console.log("Dados brutos do Supabase:", data); // Debug
        
        const projetosFormatados: Projeto[] = (
          data as ProjetoComTutorFromDB[]
        ).map((item) => {
          console.log("Item sendo processado:", item); // Debug
          
          // Correção: verificar se tutor é array ou objeto
          let tutorFormatado: Tutor | null = null;
          
          if (item.tutor) {
            if (Array.isArray(item.tutor) && item.tutor.length > 0) {
              tutorFormatado = item.tutor[0];
            } else if (!Array.isArray(item.tutor)) {
              // Se por algum motivo vier como objeto direto
              tutorFormatado = item.tutor as Tutor;
            }
          }
          
          console.log("Tutor formatado:", tutorFormatado); // Debug
          
          return {
            id_projeto: item.id_projeto,
            nome_projeto: item.nome_projeto,
            descricao: item.descricao,
            avaliacao_jovem: item.avaliacao_jovem,
            list_jovem: item.list_jovem,
            id_empresa: item.id_empresa,
            id_tutor: item.id_tutor,
            tutor: tutorFormatado,
          };
        });

        console.log("Projetos formatados:", projetosFormatados); // Debug
        setProjetos(projetosFormatados);
      }
    } catch (err) {
      console.error("Erro:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  async function handleCriarProjeto() {
    if (!formData.nome_projeto.trim() || !formData.descricao.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setSalvandoProjeto(true);

      const sessao = localStorage.getItem("usuario_sessao");
      if (!sessao) throw new Error("Nenhum usuário logado.");

      const usuario = JSON.parse(sessao);

      const projetoData = {
        nome_projeto: formData.nome_projeto.trim(),
        descricao: formData.descricao.trim(),
        id_empresa: usuario.id,
        ...(formData.id_tutor && formData.id_tutor !== "" && { id_tutor: parseInt(formData.id_tutor) }),
      };

      console.log("Dados do projeto a serem inseridos:", projetoData); // Debug

      const { error: insertError } = await supabase
        .from("projeto")
        .insert(projetoData)
        .select();

      if (insertError) {
        throw new Error(`Erro ao criar projeto: ${insertError.message}`);
      }

      setFormData({ nome_projeto: "", descricao: "", id_tutor: "" });
      setIsModalOpen(false);
      await fetchProjetos();
      alert("Projeto criado com sucesso!");
    } catch (err) {
      console.error("Erro ao criar projeto:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao criar projeto"
      );
    } finally {
      setSalvandoProjeto(false);
    }
  }

  function handleInputChange(field: keyof NovoProjetoForm, value: string) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-t from-[#1A5579] to-[#2A2570] text-white">
        <Header />
        <main className="flex">
          <AppSidebar />
          <section className="flex-1 px-6 py-10 flex justify-center items-center">
            <p className="text-xl">Carregando projetos...</p>
          </section>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-t from-[#1A5579] to-[#2A2570] text-white">
        <Header />
        <main className="flex">
          <AppSidebar />
          <section className="flex-1 px-6 py-10">
            <h1 className="text-3xl font-bold mb-6">Projetos da Empresa</h1>
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
              <p className="text-red-300">Erro: {error}</p>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="mt-16 min-h-screen bg-gradient-to-t from-[#1A5579] to-[#2A2570] text-white">
      <Header />
      <main className="flex">
        <AppSidebar />
        <section className="flex-1 px-6 py-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Projetos da Empresa</h1>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-[#1A5579] hover:bg-gray-100 font-medium">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Projeto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Criar Novo Projeto</DialogTitle>
                  <DialogDescription>
                    Preencha as informações do novo projeto. Clique em salvar
                    quando terminar.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nome_projeto">Nome do Projeto *</Label>
                    <Input
                      id="nome_projeto"
                      value={formData.nome_projeto}
                      onChange={(e) =>
                        handleInputChange("nome_projeto", e.target.value)
                      }
                      placeholder="Digite o nome do projeto"
                      disabled={salvandoProjeto}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="descricao">Descrição *</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) =>
                        handleInputChange("descricao", e.target.value)
                      }
                      placeholder="Descreva o projeto detalhadamente"
                      rows={4}
                      disabled={salvandoProjeto}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tutor">Tutor (Opcional)</Label>
                    <Select
                      value={formData.id_tutor}
                      onValueChange={(value) =>
                        handleInputChange("id_tutor", value)
                      }
                      disabled={salvandoProjeto || loadingTutores}
                    >
                      <SelectTrigger>
                        <SelectValue 
                          placeholder={
                            loadingTutores 
                              ? "Carregando tutores..." 
                              : "Selecione um tutor (opcional)"
                          } 
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sem-tutor">Nenhum tutor</SelectItem>
                        {tutores.map((tutor) => (
                          <SelectItem 
                            key={tutor.id_tutor} 
                            value={tutor.id_tutor.toString()}
                          >
                            {tutor.nome_tutor} ({tutor.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {tutores.length === 0 && !loadingTutores && (
                      <p className="text-sm text-gray-500">
                        Nenhum tutor disponível no sistema
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" disabled={salvandoProjeto}>
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button
                    onClick={handleCriarProjeto}
                    disabled={salvandoProjeto}
                  >
                    {salvandoProjeto ? "Salvando..." : "Criar Projeto"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {projetos.length === 0 ? (
            <div className="bg-white/10 rounded-lg p-8 text-center">
              <p className="text-xl mb-2">Nenhum projeto encontrado</p>
              <p className="text-gray-300 mb-4">
                Esta empresa ainda não possui projetos cadastrados.
              </p>
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-white text-[#1A5579] hover:bg-gray-100 font-medium">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Projeto
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          ) : (
            <>
              <p className="mb-4 text-gray-300">
                {projetos.length} projeto
                {projetos.length !== 1 ? "s" : ""} encontrado
                {projetos.length !== 1 ? "s" : ""}
              </p>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projetos.map((projeto) => (
                  <div
                    key={projeto.id_projeto}
                    className="bg-white text-black p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="mb-4">
                      <h2 className="text-xl font-semibold text-gray-800 mb-2">
                        {projeto.nome_projeto}
                      </h2>
                      <p className="text-gray-600 text-sm mb-1">
                        ID: {projeto.id_projeto}
                      </p>
                    </div>

                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {projeto.descricao}
                    </p>

                    {typeof projeto.avaliacao_jovem === "string" && projeto.avaliacao_jovem && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-md">
                        <p className="text-sm font-medium text-blue-800 mb-1">
                          Avaliação do Jovem:
                        </p>
                        <p className="text-sm text-blue-700 italic">
                          {projeto.avaliacao_jovem}
                        </p>
                      </div>
                    )}

                    {projeto.list_jovem && (
                      <div className="mb-4 p-3 bg-green-50 rounded-md">
                        <p className="text-sm font-medium text-green-800 mb-1">
                          Lista de Jovens:
                        </p>
                        <p className="text-sm text-green-700">
                          {projeto.list_jovem}
                        </p>
                      </div>
                    )}

                    <div className="border-t pt-4">
                      {projeto.tutor ? (
                        <div className="text-sm">
                          <p className="font-medium text-gray-800 mb-1">
                            Tutor Atribuído:
                          </p>
                          <p className="text-gray-700 font-medium">
                            {projeto.tutor.nome_tutor}
                          </p>
                          <p className="text-gray-600">{projeto.tutor.email}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            ID: {projeto.tutor.id_tutor}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm italic text-gray-500">
                          Nenhum tutor atribuído
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}