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
  projeto?: {
    nome_projeto: string;
  };
  tutor?: {
    nome_tutor: string;
  };
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

const CACHE_DURACAO = 5 * 60 * 1000;

export function useDadosUsuario() {
  const [usuario, setUsuario] = useState<DadosUsuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const supabase = createClientComponentClient();

  const lerCacheLocal = useCallback(() => {
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
  }, []);

  const salvarCacheLocal = useCallback((dados: DadosUsuario) => {
    const cacheData = {
      usuario: dados,
      timestamp: Date.now()
    };
    
    console.log("Salvando no cache:", cacheData); // Debug temporário
    
    localStorage.setItem("cache_usuario_dados", JSON.stringify(cacheData));
  }, []);

  // Função para verificar se o cache tem dados relacionados completos
  const cacheTemDadosCompletos = useCallback((dadosCache: DadosUsuario) => {
    if (dadosCache.tipo !== "jovem") return true;
    
    const jovem = dadosCache.dados as UsuarioJovem;
    
    // Se tem ID de projeto mas não tem dados do projeto, cache incompleto
    if (jovem.id_projeto && !jovem.projeto) return false;
    
    // Se tem ID de tutor mas não tem dados do tutor, cache incompleto
    if (jovem.id_tutor && !jovem.tutor) return false;
    
    return true;
  }, []);

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
      
      // Só usa o cache se ele tiver dados completos
      if (cache && cacheTemDadosCompletos(cache)) {
        console.log("Usando cache com dados completos:", cache);
        setUsuario(cache);
        return;
      }

      console.log("Cache incompleto ou inexistente, buscando dados frescos...");

      let dadosUsuario: DadosUsuario;

      if (sessao.tipo === "jovem") {
        const { data, error } = await supabase
          .from("jovem")
          .select(`
            *,
            projeto:id_projeto(nome_projeto),
            tutor:id_tutor(nome_tutor)
          `)
          .eq("id_jovem", sessao.id)
          .single();

        if (error) {
          console.error("Erro na query:", error);
          throw error;
        }
        if (!data) throw new Error("Erro ao buscar dados do jovem.");
        
        console.log("Dados buscados do Supabase:", data);
        
        dadosUsuario = { tipo: "jovem", dados: data };
      } else {
        const { data, error } = await supabase
          .from("empresa")
          .select("*")
          .eq("id_empresa", sessao.id)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Erro ao buscar dados da empresa.");
        
        dadosUsuario = { tipo: "empresa", dados: data };
      }

      setUsuario(dadosUsuario);
      salvarCacheLocal(dadosUsuario);
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErro(err.message);
      } else {
        setErro("Erro desconhecido.");
      }
    } finally {
      setCarregando(false);
    }
  }, [supabase, lerCacheLocal, salvarCacheLocal, cacheTemDadosCompletos]);

  useEffect(() => {
    buscarDadosUsuario();
  }, [buscarDadosUsuario]);

  return { usuario, carregando, erro, atualizar: buscarDadosUsuario };
}