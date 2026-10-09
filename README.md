# Academia-THOR

Aplicação web institucional e PWA para uma academia voltada ao gerenciamento de alunos, treinos, aulas, professores e experiência digital do cliente.

## Visão geral

O projeto reúne um site comercial para apresentação da academia com:

- landing page institucional;
- seção de aulas, professores, eventos, galeria e contato;
- PWA para alunos com acesso a exercícios, progresso e treino do dia;
- painel de professor para criação e edição de fichas de treino;
- painel administrativo para gestão de alunos, planos, aulas, eventos, fotos e configurações gerais.

## Funcionalidades

### Site público
- Página inicial com hero section e CTA para download do app;
- apresentação de modalidades e horários;
- cards de professores com informações detalhadas;
- seção de eventos e desafios;
- galeria de fotos;
- formulário de contato e informações da academia.

### App do aluno (PWA)
- menu de navegação para home, treinos, pagamentos e avaliação;
- visualização de treinos por ficha (A, B, C, etc.);
- progresso de sessões realizadas;
- acesso por QR Code e informações do aluno;
- funcionamento offline/instalável em dispositivos móveis.

### Portal do professor
- login simples para área do professor;
- seleção de aluno cadastrado;
- escolha de ficha de treino;
- cadastro de grupo muscular, exercícios, séries, repetições e observações;
- persistência local via `localStorage`.

### Painel administrativo
- gestão de alunos;
- cadastro de planos e aulas;
- cadastro de professores;
- cadastro de promoções e eventos;
- administração de fotos para galeria;
- edição de contatos, redes sociais e informações gerais.

## Estrutura do projeto

```text
Academia-THOR/
├── admin.html               # painel administrativo
├── index.html               # site institucional
├── professor.html           # portal do professor
├── PWA_Aluno.html           # PWA do aluno
├── Imagens/                 # imagens e banners
├── icons/                   # ícones para o PWA
├── JavaScript/              # scripts da aplicação
├── Style/                   # estilos CSS
├── manifest.json            # configuração do PWA
├── README.md                # documentação do projeto
└── ...
```

## Como executar

Como é um projeto estático, basta abrir os arquivos HTML diretamente em um navegador ou servir a pasta localmente.

### Opção 1: abrir diretamente
- abra `index.html` no navegador;
- para acessar o painel administrativo, abra `admin.html`;
- para acessar o portal do professor, abra `professor.html`;
- para testar o app do aluno, abra `PWA_Aluno.html`.

### Opção 2: servidor local

```bash
cd /workspaces/Academia-THOR
python3 -m http.server 8000
```

Depois acesse:

- `http://localhost:8000/`
- `http://localhost:8000/admin.html`
- `http://localhost:8000/professor.html`
- `http://localhost:8000/PWA_Aluno.html`

## Observações

- O projeto usa armazenamento local (`localStorage`) para simular dados do sistema sem backend;
- a experiência mobile é otimizada para uso como PWA;
- o conteúdo e os dados podem ser ajustados para atender regras reais de negócio, autenticação e persistência em banco de dados.

## Tecnologias

- HTML5
- CSS3
- JavaScript
- Progressive Web App (PWA)

## Licença

Este projeto está disponível para uso educacional e de demonstração. Ajustes e customizações podem ser feitos conforme a necessidade do cliente ou da equipe de desenvolvimento.
