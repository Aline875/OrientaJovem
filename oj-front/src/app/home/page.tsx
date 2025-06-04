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
  email_empresa: string; // Corrigido para corresponder aos dados reais
  cnpj?: number;
  telefone?: string;
  senha?: string;
  list_jovens?: string | null;
  list_tutor?: string | null;
  id_projeto?: number | null;
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

// Função para validar se objeto é UsuarioEmpresa - CORRIGIDA
function isUsuarioEmpresa(obj: unknown): obj is UsuarioEmpresa {
  if (
    typeof obj === "object" &&
    obj !== null &&
    "id_empresa" in obj &&
    "nome_empresa" in obj &&
    "email_empresa" in obj // Corrigido para corresponder aos dados reais
  ) {
    const o = obj as { [key: string]: unknown };
    return (
      typeof o.id_empresa === "number" &&
      typeof o.nome_empresa === "string" &&
      typeof o.email_empresa === "string" // Corrigido para corresponder aos dados reais
    );
  }
  return false;
}

// Função para validar ID antes de usar em consultas
// function validarId(id: unknown): number | null {
//   if (typeof id === "number" && !isNaN(id) && id > 0) {
//     return id;
//   }
//   if (typeof id === "string" && id !== "undefined" && !isNaN(parseInt(id))) {
//     const numId = parseInt(id);
//     return numId > 0 ? numId : null;
//   }
//   return null;
// }

export default function Home() {
  const [usuario, setUsuario] = useState<DadosUsuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<number>(0);

  const supabase = createClientComponentClient();
  const router = useRouter();

  const precisaAtualizar = useCallback(() => {
    return Date.now() - ultimaAtualizacao > 5 * 60 * 1000; // 5 minutos
  }, [ultimaAtualizacao]);

  const salvarCacheLocal = useCallback((dadosUsuario: DadosUsuario) => {
    try {
      localStorage.setItem(
        "cache_usuario_dados",
        JSON.stringify({
          usuario: dadosUsuario,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.warn("Erro ao salvar cache:", error);
    }
  }, []);

  type UsuarioCache = {
    dados: unknown;
  };

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

      if (cache.usuario && typeof cache.usuario === "object") {
        const userData = cache.usuario as UsuarioCache;

        if (isUsuarioJovem(userData.dados)) {
          return { tipo: "jovem", dados: userData.dados };
        }

        if (isUsuarioEmpresa(userData.dados)) {
          return { tipo: "empresa", dados: userData.dados };
        }
      }

      return null;
    } catch (error) {
      console.error("Erro ao ler cache local:", error);
      return null;
    }
  }, []);

  const buscarDadosUsuario = useCallback(
    async (forcarAtualizacao = false) => {
      try {
        setCarregando(true);
        setErro(null);

        const sessaoString = localStorage.getItem("usuario_sessao");
        if (!sessaoString) {
          throw new Error("Usuário não está logado");
        }

        let sessao: SessaoUsuario;
        try {
          sessao = JSON.parse(sessaoString);
        } catch {
          localStorage.removeItem("usuario_sessao");
          throw new Error("Dados de sessão corrompidos");
        }

        // Validar dados da sessão - versão mais permissiva
        if (
          !sessao.id ||
          (typeof sessao.id !== "number" && isNaN(parseInt(String(sessao.id))))
        ) {
          console.error("Sessão inválida:", sessao);
          localStorage.removeItem("usuario_sessao");
          throw new Error("ID de sessão inválido");
        }

        const idValido =
          typeof sessao.id === "number"
            ? sessao.id
            : parseInt(String(sessao.id));

        if (idValido <= 0) {
          localStorage.removeItem("usuario_sessao");
          throw new Error("ID de sessão deve ser maior que zero");
        }

        const agora = Date.now();
        const tempoExpiracao = 24 * 60 * 60 * 1000;

        if (agora - sessao.timestamp > tempoExpiracao) {
          localStorage.removeItem("usuario_sessao");
          localStorage.removeItem("cache_usuario_dados");
          throw new Error("Sessão expirada. Faça login novamente.");
        }

        // Tentar usar cache se não forçar atualização
        if (!forcarAtualizacao) {
          const dadosCache = lerCacheLocal();
          if (dadosCache) {
            setUsuario(dadosCache);
            setCarregando(false);
            return;
          }
        }

        console.log("Buscando dados para:", {
          tipo: sessao.tipo,
          id: idValido,
        });

        // Buscar dados do banco
        if (sessao.tipo === "jovem") {
          const { data, error } = await supabase
            .from("jovem")
            .select(
              "id_jovem, login, cpf, nome, email, list_avaliação, id_projeto, id_tutor, id_empresa"
            )
            .eq("id_jovem", idValido)
            .single();

          if (error) {
            console.error("Erro do Supabase (jovem):", error);
            throw new Error(`Erro ao buscar dados do jovem: ${error.message}`);
          }

          if (!data) {
            throw new Error("Nenhum dado encontrado para este jovem.");
          }

          if (!isUsuarioJovem(data)) {
            console.error("Dados inválidos do jovem:", data);
            throw new Error("Dados do jovem estão em formato inválido.");
          }

          const dadosUsuario: DadosUsuario = { tipo: "jovem", dados: data };
          setUsuario(dadosUsuario);
          salvarCacheLocal(dadosUsuario);
        } else if (sessao.tipo === "empresa") {
          const { data, error } = await supabase
            .from("empresa")
            .select("*")
            .eq("id_empresa", idValido)
            .single();

          if (error) {
            console.error("Erro do Supabase (empresa):", error);
            throw new Error(
              `Erro ao buscar dados da empresa: ${error.message}`
            );
          }

          if (!data) {
            throw new Error("Nenhum dado encontrado para esta empresa.");
          }

          console.log("Dados da empresa recebidos:", data);

          if (!isUsuarioEmpresa(data)) {
            console.error("Dados inválidos da empresa:", data);
            throw new Error("Dados da empresa estão em formato inválido.");
          }

          const dadosUsuario: DadosUsuario = { tipo: "empresa", dados: data };
          setUsuario(dadosUsuario);
          salvarCacheLocal(dadosUsuario);
        } else {
          throw new Error("Tipo de usuário inválido na sessão.");
        }

        setUltimaAtualizacao(Date.now());
      } catch (error: unknown) {
        const msg =
          error instanceof Error ? error.message : "Erro desconhecido";
        console.error("Erro em buscarDadosUsuario:", msg);
        setErro(msg);

        // Se erro for de autenticação, limpar dados e redirecionar
        if (
          msg.includes("logado") ||
          msg.includes("sessão") ||
          msg.includes("Sessão")
        ) {
          localStorage.clear();
          router.push("/");
        }
      } finally {
        setCarregando(false);
      }
    },
    [supabase, lerCacheLocal, salvarCacheLocal, router]
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
          link: "/",
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
            link: "/empresaPage/profile",
          },
          {
            title: "Publicar Vagas",
            text: "Crie e gerencie oportunidades para jovens.",
            link: "/empresaPage/projects",
          },
          {
            title: "Candidatos",
            text: "Visualize e avalie candidatos às suas vagas.",
            link: "/empresaPage/dashboard",
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

  const obterNomeUsuario = useCallback(() => {
    if (!usuario) return "Usuário";

    if (usuario.tipo === "jovem") {
      const jovem = usuario.dados as UsuarioJovem;
      return jovem.nome || "Jovem";
    } else {
      const empresa = usuario.dados as UsuarioEmpresa;
      return empresa.nome_empresa || "Empresa";
    }
  }, [usuario]);

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
                    ? `👋 Olá, ${obterNomeUsuario()}!`
                    : "👋 Bem-vindo!"}
            </CardTitle>
            {usuario && (
              <button
                onClick={handleLogout}
                className="ml-4 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-md shadow transition-colors"
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
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 max-w-md text-center">
            <p className="text-red-300 text-sm mb-2">{erro}</p>
            <button
              onClick={handleRefresh}
              className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
