// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";

// type Project = {
//     id: string;
//     name: string;
//     description: string;
//     // adicione outros campos conforme necessário
// };

// async function fetchProjectById(id: string): Promise<Project | null> {
//     // Substitua pela sua lógica real de busca (API, etc)
//     // Exemplo fictício:
//     const response = await fetch(`/api/projects/${id}`);
//     if (!response.ok) return null;
//     return response.json();
//}

export default function ProjectDetailsPage() {
  // const { id } = useParams<{ id: string }>();
  // const [project, setProject] = useState<Project | null>(null);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //     if (id) {
  //         fetchProjectById(id).then((data) => {
  //             setProject(data);
  //             setLoading(false);
  //         });
  //     }
  // }, [id]);

  // if (loading) return <div>Carregando...</div>;
  // if (!project) return <div>Projeto não encontrado.</div>;

  return (
    // <div>
    //     <h1>{project.name}</h1>
    //     <p>{project.description}</p>
    //     {/* Adicione mais detalhes conforme necessário */}
    // </div>
    <></>
  );
}
