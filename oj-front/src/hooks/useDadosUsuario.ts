// hooks/useDadosUsuario.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

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

type TipoUsuario = "jovem" | "empresa";

interface DadosUsuario {
  tipo: TipoUsuario;
  dados: UsuarioJovem | UsuarioEmpresa;
}

interface SessaoUsuario {
  id: number;
  email: string;
  tipo: TipoUsuario;
  timestamp: number;
}

export function useDadosUsuario() {
  const [usuario, setUsuario] = useState<DadosUsuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const CACHE_DURACAO = 5 * 60 * 1000;
  const supabase = createClientComponentClient();

  const lerCacheLocal = () => {
    try {
      const cacheString = localStorage.getItem("cache_usuario_dados");
      if (!cacheString) return null;

      const cache = JSON.parse(cacheString);
      const agora = Date.now();

      if (agora - cache.timestamp > CACHE_DURACAO) {
        localStorage.removeItem("cache_usuario_dados");
        return null;
      }

      return cache.usuario as DadosUsuario;
    } catch {
      localStorage.removeItem("cache_usuario_dados");
      return null;
    }
  };

  const salvarCacheLocal = (dados: DadosUsuario) => {
    localStorage.setItem(
      "cache_usuario_dados",
      JSON.stringify({ usuario: dados, timestamp: Date.now() })
    );
  };

  const buscarDadosUsuario = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);

      const sessaoString = localStorage.getItem("usuario_sessao");
      if (!sessaoString) throw new Error("Usuário não está logado.");

      const sessao: SessaoUsuario = JSON.parse(sessaoString);
      const agora = Date.now();
      if (agora - sessao.timestamp > 24 * 60 * 60 * 1000) {
        localStorage.clear();
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      const cache = lerCacheLocal();
      if (cache) {
        setUsuario(cache);
        return;
      }

      let dadosUsuario: DadosUsuario;

      if (sessao.tipo === "jovem") {
        const { data, error } = await supabase
          .from("jovem")
          .select("*")
          .eq("id_jovem", sessao.id)
          .single();
        if (error || !data) throw new Error("Erro ao buscar dados do jovem.");

        dadosUsuario = { tipo: "jovem", dados: data };
      } else {
        const { data, error } = await supabase
          .from("empresa")
          .select("*")
          .eq("id_empresa", sessao.id)
          .single();
        if (error || !data) throw new Error("Erro ao buscar dados da empresa.");

        dadosUsuario = { tipo: "empresa", dados: data };
      }

      setUsuario(dadosUsuario);
      salvarCacheLocal(dadosUsuario);
    } catch (err: any) {
      setErro(err.message || "Erro desconhecido.");
    } finally {
      setCarregando(false);
    }
  }, [supabase]);

  useEffect(() => {
    buscarDadosUsuario();
  }, [buscarDadosUsuario]);

  return { usuario, carregando, erro, atualizar: buscarDadosUsuario };
}
