# OrientaJovem

![OrientaJovem Logo](public/logo.png)

## 📋 Sobre o Projeto

OrientaJovem é uma plataforma desenvolvida para auxiliar jovens em seu desenvolvimento profissional, oferecendo orientação, acompanhamento de projetos e análise de desempenho de forma intuitiva e acessível.

## ✨ Funcionalidades

- **Dashboard Personalizado:** Visão geral e acesso rápido a todas as funcionalidades
- **Perfil do Usuário:** Gerenciamento de informações pessoais e profissionais
- **Gerenciamento de Projetos:** Acompanhamento e organização de projetos em andamento
- **Análise de Desempenho:** Métricas e indicadores de progresso profissional
- **Interface Responsiva:** Experiência otimizada para dispositivos móveis e desktop

## 🚀 Tecnologias Utilizadas

- [Next.js](https://nextjs.org/) - Framework React para produção
- [React](https://reactjs.org/) - Biblioteca JavaScript para interfaces de usuário
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitário
- [Lucide React](https://lucide.dev/) - Ícones SVG para React
- [Supabase](https://supabase.io/) - Plataforma de backend como serviço (BaaS)
- [PostgreSQL](https://www.postgresql.org/) - Sistema de gerenciamento de banco de dados relacional
- [Postman](https://www.postman.com/) - Plataforma para teste e documentação de APIs

## 🛠️ Instalação e Uso

### Pré-requisitos

- Node.js 16.x ou superior
- npm ou yarn

### Passos para instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/orientajovem.git
cd orientajovem
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```
Edite o arquivo `.env.local` com suas configurações, incluindo as credenciais do Supabase.

4. Configure a conexão com o Supabase:
- Configure suas variáveis de ambiente do Supabase no arquivo `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-do-supabase
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

6. Acesse `http://localhost:3000` no seu navegador.

## 📁 Estrutura do Projeto

```
orientajovem/
├── app/                    # Diretório principal do Next.js App Router
│   ├── home/               # Página inicial da aplicação
│   ├── jovemPage/          # Páginas específicas para usuários
│   │   ├── dashboard/      # Dashboard do usuário
│   │   ├── profile/        # Perfil do usuário
│   │   └── projects/       # Gerenciamento de projetos
│   └── layout.js           # Layout principal da aplicação
├── components/             # Componentes reutilizáveis
│   ├── Header.jsx          # Componente de cabeçalho
│   ├── Sidebar.jsx         # Barra lateral de navegação
│   └── ui/                 # Componentes de UI
├── public/                 # Arquivos estáticos
└── styles/                 # Estilos globais
```

## 🔄 Fluxo de Trabalho de Desenvolvimento

1. Crie uma nova branch para cada feature:
```bash
git checkout -b feature/nome-da-feature
```

2. Faça commits com mensagens claras:
```bash
git commit -m "feat: adiciona componente de navegação"
```

3. Envie a branch para o repositório remoto:
```bash
git push origin feature/nome-da-feature
```

4. Abra um Pull Request para revisão de código.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie sua branch de feature (`git checkout -b feature/amazing-feature`)
3. Commit suas alterações (`git commit -m 'feat: add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

## 👥 Equipe

- [Aline Beatriz](https://github.com/Aline875) - Scrum Master
- [Samava Vitoria](https://github.com/iamsamarav) - Dev Backend
- [Matheus Diniz](https://github.com/sediniz) - Dados

## 📞 Contato

- Email: alinebeatriz875@gmail.com
- Website: [https://orienta-jovem.vercel.app/](https://orienta-jovem.vercel.app/)
- GitHub: [github.com/orientajovem](https://github.com/orientajovem)

---

Desenvolvido com ❤️ pelo time OrientaJovem
