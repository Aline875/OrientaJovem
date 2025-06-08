"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import AppSidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

type Tutor = {
  id_tutor: number;
  nome_tutor: string;
};

type Projeto = {
  id_projeto: number;
  nome_projeto: string;
  tutor: Tutor | null;
};

export default function ListaProjetos() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nome_projeto: "",
    descricao: "",
    id_tutor: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjetos();
    fetchTutores();
  }, []);

  async function fetchProjetos() {
    try {
      setLoading(true);
      const sessao = localStorage.getItem("usuario_sessao");
      if (!sessao) throw new Error("Nenhum usuário logado.");

      const usuario = JSON.parse(sessao);
      if (usuario.tipo !== "empresa") throw new Error("Usuário inválido.");

      const { data, error: supabaseError } = await supabase
        .from("projeto")
        .select(
          `
          id_projeto,
          nome_projeto,
          tutor:id_tutor (
            id_tutor,
            nome_tutor
          )
        `
        )
        .eq("id_empresa", usuario.id);

      if (supabaseError) throw supabaseError;

      const projetosFormatados: Projeto[] = (data ?? []).map(
        (item: {
          id_projeto: number;
          nome_projeto: string;
          tutor: Tutor | Tutor[] | null;
        }) => ({
          id_projeto: item.id_projeto,
          nome_projeto: item.nome_projeto,
          tutor: Array.isArray(item.tutor) ? item.tutor[0] : item.tutor,
        })
      );

      setProjetos(projetosFormatados);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar projetos."
      );
    } finally {
      setLoading(false);
    }
  }

  async function fetchTutores() {
    try {
      const { data, error: supabaseError } = await supabase
        .from("tutor")
        .select("id_tutor, nome_tutor")
        .order("nome_tutor");

      if (supabaseError) throw supabaseError;
      setTutores(data || []);
    } catch (err) {
      console.error("Erro ao carregar tutores:", err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.nome_projeto.trim()) {
      alert("Nome do projeto é obrigatório!");
      return;
    }

    try {
      setSubmitting(true);
      const sessao = localStorage.getItem("usuario_sessao");
      if (!sessao) throw new Error("Nenhum usuário logado.");

      const usuario = JSON.parse(sessao);

      const { error: supabaseError } = await supabase
        .from("projeto")
        .insert([
          {
            nome_projeto: formData.nome_projeto.trim(),
            descricao: formData.descricao.trim(),
            id_tutor: formData.id_tutor ? parseInt(formData.id_tutor) : null,
            id_empresa: usuario.id
          }
        ])
        .select();

      if (supabaseError) throw supabaseError;

      // Limpar formulário e fechar modal
      setFormData({ nome_projeto: "", descricao: "", id_tutor: "" });
      setShowForm(false);
      
      // Recarregar lista de projetos
      await fetchProjetos();
      
      alert("Projeto criado com sucesso!");
    } catch (err) {
      console.error("Erro ao criar projeto:", err);
      alert("Erro ao criar projeto. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  function handleSelectChange(value: string) {
    setFormData(prev => ({
      ...prev,
      id_tutor: value || ""
    }));
  }

  return (
    <div className="mt-16 min-h-screen bg-gradient-to-t from-[#1A5579] to-[#2A2570] text-white">
      <Header />
      <main className="flex">
        <AppSidebar />
        <section className="flex-1 px-6 py-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Projetos</h1>
            
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Projeto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Criar Novo Projeto</DialogTitle>
                  <DialogDescription>
                    Preencha as informações do projeto. O nome é obrigatório.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome_projeto">Nome do Projeto *</Label>
                    <Input
                      id="nome_projeto"
                      name="nome_projeto"
                      value={formData.nome_projeto}
                      onChange={handleInputChange}
                      placeholder="Digite o nome do projeto"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      name="descricao"
                      value={formData.descricao}
                      onChange={handleInputChange}
                      placeholder="Descreva o projeto (opcional)"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tutor">Tutor</Label>
                    <div className="flex gap-2">
                      <Select 
                        value={formData.id_tutor || undefined} 
                        onValueChange={handleSelectChange}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Selecione um tutor (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {tutores.map((tutor) => (
                            <SelectItem 
                              key={tutor.id_tutor} 
                              value={tutor.id_tutor.toString()}
                            >
                              {tutor.nome_tutor}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.id_tutor && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData(prev => ({ ...prev, id_tutor: "" }))}
                        >
                          Limpar
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="flex-1"
                    >
                      {submitting ? "Criando..." : "Criar Projeto"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <p>Carregando...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : projetos.length === 0 ? (
            <p>Nenhum projeto encontrado.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projetos.map((projeto) => (
                <Link
                  key={projeto.id_projeto}
                  href={`/empresaPage/projects/${projeto.id_projeto}`}
                  className="bg-white text-black p-6 rounded-lg shadow hover:bg-gray-100 transition block"
                >
                  <h2 className="font-semibold text-xl mb-1">
                    {projeto.nome_projeto}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Tutor: {projeto.tutor?.nome_tutor || "Não definido"}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}