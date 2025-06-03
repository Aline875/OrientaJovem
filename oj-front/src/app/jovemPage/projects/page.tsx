"use client";

// import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import AppSidebar from "@/components/Sidebar";

// interface Projeto {
//   nome_projeto: string;
//   descricao: string;
//   avaliacao_jovem?: string;
//   empresa: {
//     nome_empresa: string;
//     email_empresa: string;
//   } | null;
//   tutor: {
//     nome_tutor: string;
//     email_tutor: string;
//   } | null;
// }

// interface Avaliacao {
//   id_avaliacao: number;
//   nota: number;
//   comentario: string;
// }

export default function ProjetoDoJovem() {
//   const [projeto, setProjeto] = useState<Projeto | null>(null);
//   const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function fetchDados() {
//       setLoading(true);

//       const sessao = localStorage.getItem("usuario_sessao");
//       if (!sessao) {
//         console.error("Nenhum usuário logado.");
//         setLoading(false);
//         return;
//       }

//       const usuario = JSON.parse(sessao);

//       if (usuario.tipo !== "jovem") {
//         console.error("Usuário logado não é um jovem.");
//         setLoading(false);
//         return;
//       }

//       // 1. Buscar dados do jovem (id_projeto e list_avaliação)
//       const { data: jovem, error: errorJovem } = await supabase
//         .from("jovem")
//         .select("id_projeto, list_avaliação")
//         .eq("id_jovem", usuario.id)
//         .single();

//       if (errorJovem || !jovem?.id_projeto) {
//         console.error("Erro ao buscar jovem ou projeto não atribuído.");
//         setLoading(false);
//         return;
//       }

//       // 2. Buscar dados do projeto incluindo tutor e empresa (relacionamentos)
// const { data: projetoData, error: errorProjeto } = await supabase
//   .from("projeto")
//   .select(`
//     nome_projeto,
//     descricao,
//     avaliacao_jovem,
//     empresa (
//       nome_empresa,
//       email_empresa
//     ),
//     tutor (
//       nome_tutor,
//       email_tutor
//     )
//   `)
//   .eq("id_projeto", jovem.id_projeto)
//   .single();



//       if (errorProjeto || !projetoData) {
//         console.error("Erro ao buscar projeto.", errorProjeto);
//         setLoading(false);
//         return;
//       }

//       setProjeto(projetoData);

//       // 3. Buscar avaliações vinculadas ao jovem (se houver)
//       if (jovem.list_avaliação) {
//         // Como list_avaliação parece ser um id único, ajustei para single()
//         const { data: avaliacaoData, error: errorAvaliacao } = await supabase
//           .from("avaliacao")
//           .select("id_avaliacao, nota, comentario")
//           .eq("id_avaliacao", jovem.list_avaliação)
//           .single();

//         if (!errorAvaliacao && avaliacaoData) {
//           setAvaliacoes([avaliacaoData]); // Coloca em array mesmo se for só uma
//         }
//       }

//       setLoading(false);
//     }

//     fetchDados();
//   }, []);

  return (
    <div className="min-h-screen bg-gradient-to-t from-[#1A5579] to-[#2A2570] text-white">
      <Header />
      <main className="flex">
        <AppSidebar />
        {/* <section className="flex-1 flex flex-col items-center justify-center px-6 py-10">
          {loading ? (
            <p>Carregando...</p>
          ) : !projeto ? (
            <p>Nenhum projeto encontrado.</p>
          ) : (
            <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl w-full text-black space-y-4">
              <h2 className="text-2xl font-bold">{projeto.nome_projeto}</h2>
              <p>{projeto.descricao}</p>

              {projeto.avaliacao_jovem && (
                <p className="italic text-sm text-gray-700">
                  Avaliação do Jovem: {projeto.avaliacao_jovem}
                </p>
              )}

              <div className="mt-4">
                <h3 className="font-semibold text-lg">Empresa Responsável:</h3>
                {projeto.empresa ? (
                  <p>
                    {projeto.empresa.nome_empresa} ({projeto.empresa.email_empresa})
                  </p>
                ) : (
                  <p>Empresa não atribuída</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-lg">Tutor do Projeto:</h3>
                {projeto.tutor ? (
                  <p>
                    {projeto.tutor.nome_tutor} ({projeto.tutor.email_tutor})
                  </p>
                ) : (
                  <p>Tutor não atribuído</p>
                )}
              </div>

              <div className="mt-4">
                <h3 className="font-semibold text-lg">Avaliações Recebidas:</h3>
                {avaliacoes.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {avaliacoes.map((a) => (
                      <li key={a.id_avaliacao}>
                        Nota: {a.nota} - {a.comentario}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Sem avaliações registradas.</p>
                )}
              </div>
            </div>
          )}
        </section> */}
      </main>
    </div>
  );
}
