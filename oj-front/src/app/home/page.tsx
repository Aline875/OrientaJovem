"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UsuarioJovem {
  id_jovem: number;
  login: string;
  cpf: number;
  nome: string;
  email: string;
  list_avaliação: string | null;
  id_projeto: number | null;
  id_tutor: number | null;
  id_empresa: number | null;
}

interface UsuarioEmpresa {
  id_empresa: number;
  nome_empresa: string;
  email: string;
  cnpj?: string;
  telefone?: string;
}

interface DadosUsuario {
  tipo: "jovem" | "empresa";
  dados: UsuarioJovem | UsuarioEmpresa;
}

interface SessaoUsuario {
  id: number;
  email: string;
  tipo: "jovem" | "empresa";
  timestamp: number;
}

// Função para validar se objeto é UsuarioJovem
function isUsuarioJovem(obj: unknown): obj is UsuarioJovem {
  if (
    typeof obj === "object" &&
    obj !== null &&
    "id_jovem" in obj &&
    "login" in obj &&
    "cpf" in obj &&
    "nome" in obj &&
    "email" in obj
  ) {
    const o = obj as { [key: string]: unknown };
    return (
      typeof o.id_jovem === "number" &&
      typeof o.login === "string" &&
      typeof o.cpf === "number" &&
      typeof o.nome === "string" &&
      typeof o.email === "string"
    );
  }
  return false;
}

// Função para validar se objeto é UsuarioEmpresa
function isUsuarioEmpresa(obj: unknown): obj is UsuarioEmpresa {
  if (
    typeof obj === "object" &&
    obj !== null &&
    "id_empresa" in obj &&
    "nome_empresa" in obj &&
    "email" in obj
  ) {
    const o = obj as { [key: string]: unknown };
    return (
      typeof o.id_empresa === "number" &&
      typeof o.nome_empresa === "string" &&
      typeof o.email === "string"
    );
  }
  return false;
}

export default function Home() {
  const [usuario, setUsuario] = useState<DadosUsuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<number>(0);

  const supabase = createClientComponentClient();
  const router = useRouter();

  // ... (tudo acima permanece igual até...)

  const precisaAtualizar = useCallback(() => {
    return Date.now() - ultimaAtualizacao > 5 * 60 * 1000; // CACHE_DURACAO
  }, [ultimaAtualizacao]); // removido CACHE_DURACAO

  // ...
  const salvarCacheLocal = useCallback((dadosUsuario: DadosUsuario) => {
    localStorage.setItem(
      "cache_usuario_dados",
      JSON.stringify({
        usuario: dadosUsuario,
        timestamp: Date.now(),
      })
    );
  }, []);

  const lerCacheLocal = useCallback((): DadosUsuario | null => {
    try {
      const cacheString = localStorage.getItem("cache_usuario_dados");
      if (!cacheString) return null;

      const cache: { usuario: unknown; timestamp: number } =
        JSON.parse(cacheString);
      const agora = Date.now();

      if (agora - cache.timestamp > 5 * 60 * 1000) {
        localStorage.removeItem("cache_usuario_dados");
        return null;
      }

      if (isUsuarioJovem(cache.usuario) || isUsuarioEmpresa(cache.usuario)) {
        return cache.usuario as unknown as DadosUsuario;
      }

      return null;
    } catch {
      localStorage.removeItem("cache_usuario_dados");
      return null;
    }
  }, []); // removido CACHE_DURACAO das dependências

  // ...

  const buscarDadosUsuario = useCallback(
    async (forcarAtualizacao = false) => {
      try {
        setCarregando(true);
        setErro(null);

        const sessaoString = localStorage.getItem("usuario_sessao");
        if (!sessaoString) throw new Error("Usuário não está logado");

        const sessao: SessaoUsuario = JSON.parse(sessaoString);
        const agora = Date.now();
        const tempoExpiracao = 24 * 60 * 60 * 1000;

        if (agora - sessao.timestamp > tempoExpiracao) {
          localStorage.removeItem("usuario_sessao");
          localStorage.removeItem("cache_usuario_dados");
          throw new Error("Sessão expirada. Faça login novamente.");
        }

        if (!forcarAtualizacao) {
          const dadosCache = lerCacheLocal();
          if (dadosCache) {
            setUsuario(dadosCache);
            setCarregando(false);
            return;
          }
        }

        if (sessao.tipo === "jovem") {
          const { data, error } = await supabase
            .from("jovem")
            .select(
              "id_jovem, login, cpf, nome, email, list_avaliação, id_projeto, id_tutor, id_empresa"
            )
            .eq("id_jovem", sessao.id)
            .single();

          if (error || !data) throw new Error("Erro ao buscar dados do jovem.");

          if (!isUsuarioJovem(data)) {
            throw new Error("Dados do jovem estão em formato inválido.");
          }

          const dadosUsuario: DadosUsuario = { tipo: "jovem", dados: data };
          setUsuario(dadosUsuario);
          salvarCacheLocal(dadosUsuario);
        } else if (sessao.tipo === "empresa") {
          const { data, error } = await supabase
            .from("empresa")
            .select("*")
            .eq("id_empresa", sessao.id)
            .single();

          if (error || !data)
            throw new Error("Erro ao buscar dados da empresa.");

          if (!isUsuarioEmpresa(data)) {
            throw new Error("Dados da empresa estão em formato inválido.");
          }

          const dadosUsuario: DadosUsuario = { tipo: "empresa", dados: data };
          setUsuario(dadosUsuario);
          salvarCacheLocal(dadosUsuario);
        }

        setUltimaAtualizacao(Date.now());
      } catch (error: unknown) {
        const msg =
          error instanceof Error ? error.message : "Erro desconhecido";
        console.error(msg);
        setErro(msg);
      } finally {
        setCarregando(false);
      }
    },
    [supabase, lerCacheLocal, salvarCacheLocal] // removido CACHE_DURACAO
  );

  useEffect(() => {
    buscarDadosUsuario();
  }, [buscarDadosUsuario]);

  const handleRefresh = useCallback(() => {
    buscarDadosUsuario(true);
  }, [buscarDadosUsuario]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && precisaAtualizar()) {
        buscarDadosUsuario();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [buscarDadosUsuario, precisaAtualizar]);

  const cardsPersonalizados = useMemo(() => {
    if (!usuario) {
      return [
        {
          title: "Login",
          text: "Faça login para acessar o sistema.",
          link: "/login",
        },
        {
          title: "Cadastro",
          text: "Ainda não tem conta? Cadastre-se aqui.",
          link: "/cadastro",
        },
        {
          title: "Sobre",
          text: "Conheça mais sobre nossa plataforma.",
          link: "/sobre",
        },
      ];
    }

    return usuario.tipo === "jovem"
      ? [
          {
            title: "Meu Perfil",
            text: "Complete e atualize suas informações pessoais.",
            link: "/jovemPage/profile",
          },
          {
            title: "Oportunidades",
            text: "Descubra vagas e projetos disponíveis.",
            link: "/jovemPage/projects",
          },
          {
            title: "Meu Desempenho",
            text: "Acompanhe seu progresso e feedbacks.",
            link: "/jovemPage/dashboard",
          },
        ]
      : [
          {
            title: "Perfil da Empresa",
            text: "Gerencie as informações da sua empresa.",
            link: "/empresa/perfil",
          },
          {
            title: "Publicar Vagas",
            text: "Crie e gerencie oportunidades para jovens.",
            link: "/empresa/vagas",
          },
          {
            title: "Candidatos",
            text: "Visualize e avalie candidatos às suas vagas.",
            link: "/empresa/candidatos",
          },
        ];
  }, [usuario]);

  const statusCache = useMemo(() => {
    if (!usuario) return null;
    const tempo = Date.now() - ultimaAtualizacao;
    const minutos = Math.floor(tempo / 60000);
    if (tempo < 60000)
      return { texto: "Dados atualizados agora", cor: "text-green-300" };
    if (minutos < 5)
      return { texto: `Atualizado há ${minutos}min`, cor: "text-yellow-300" };
    return { texto: "Dados podem estar desatualizados", cor: "text-red-300" };
  }, [usuario, ultimaAtualizacao]);

  const handleLogout = useCallback(() => {
    localStorage.clear();
    router.push("/");
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-t from-[#1A5579] to-[#2A2570] text-white">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 space-y-6">
        <Card className="w-full max-w-5xl bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl md:text-3xl text-center flex-1">
              {carregando
                ? "⏳ Carregando..."
                : erro
                  ? "❌ Erro ao carregar dados"
                  : usuario
                    ? `👋 Olá, ${
                        usuario.tipo === "jovem"
                          ? ((usuario.dados as UsuarioJovem).nome ?? "Usuário")
                          : ((usuario.dados as UsuarioEmpresa).nome_empresa ??
                            "Empresa")
                      }!`
                    : "👋 Bem-vindo!"}
            </CardTitle>
            {usuario && (
              <button
                onClick={handleLogout}
                className="ml-4 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-md shadow"
              >
                Sair
              </button>
            )}
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 pb-8">
            {cardsPersonalizados.map((card, index) => (
              <Link
                key={index}
                href={card.link}
                className="bg-white/10 hover:bg-white/20 transition-all duration-200 p-6 rounded-xl shadow-lg flex flex-col justify-between border border-white/30"
              >
                <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                <p className="text-sm text-white/80">{card.text}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
        {statusCache && (
          <p className={`text-sm mt-2 ${statusCache.cor}`}>
            {statusCache.texto}
          </p>
        )}
        {erro && (
          <p className="text-red-400 text-sm mt-2">
            {erro}{" "}
            <button onClick={handleRefresh} className="underline">
              Tentar novamente
            </button>
          </p>
        )}
      </main>
    </div>
  );
}
