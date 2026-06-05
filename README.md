# Rivulus Vocacional
### Plataforma de Orientação Vocacional e Profissional
**Academia Gama** | Angola

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Backend | Firebase (Auth + Firestore + Storage) |
| Processamento | Netlify Functions |
| IA Conselheira | Gemini API |
| Hospedagem | Netlify |

---

## Estrutura do Projecto

```
src/
├── app/                     # Next.js App Router
│   ├── auth/                # Login, registo
│   ├── dashboard/           # Dashboards por role
│   ├── avaliacoes/          # Módulo de testes (18 testes)
│   ├── perfil/              # Perfil vocacional do estudante
│   ├── relatorios/          # Geração e consulta de relatórios
│   ├── orientador/          # Área do orientador
│   └── admin/               # Painel de administração
├── components/
│   ├── ui/                  # Shadcn UI base components
│   ├── layout/              # Sidebar, header, navigation
│   ├── avaliacoes/          # Player de testes, resultados
│   ├── perfil/              # Cards de perfil vocacional
│   ├── relatorios/          # Visualização de relatórios
│   └── ia/                  # Chat com IA Conselheira
├── lib/
│   ├── firebase/            # config.ts, collections.ts, rules, indexes
│   ├── hooks/               # useAuth, useEstudante, useTeste, etc.
│   ├── utils/               # Funções auxiliares
│   └── validators/          # Zod schemas
├── types/                   # TypeScript types (source of truth)
└── constants/               # Catálogo de testes, labels, etc.
netlify/
└── functions/               # gerar-perfil.ts, ia-conselheira.ts
```

---

## Módulo de Avaliações — 18 Testes

### Área 1: Quem Sou Eu (6 testes)
- RIASEC
- Inteligências Múltiplas
- Estilo de Aprendizagem VAK
- Valores de Carreira
- Motivadores Profissionais
- Interesses Académicos

### Área 2: Como Funciono (7 testes)
- Big Five Adaptado
- Temperamento Keirsey
- VIA — Forças de Carácter
- Resiliência
- Autorregulação
- Estilos de Comunicação
- Autoconfiança

### Área 3: Para Onde Vou (5 testes)
- Âncoras de Carreira
- Clareza Vocacional
- Maturidade Vocacional
- Estilos de Tomada de Decisão
- Planeamento de Futuro

---

## Configuração

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.local.example .env.local
# Preencher com valores do Firebase e Gemini

# 3. Correr em desenvolvimento
npm run dev
```

---

## Regras Firestore

Copiar o conteúdo de `src/lib/firebase/firestore.rules`
para Firebase Console > Firestore > Rules.

## Índices Firestore

Importar `src/lib/firebase/firestore.indexes.json`
em Firebase Console > Firestore > Indexes.

---

## Integração Futura com Rivulus

A plataforma foi desenhada com arquitectura desacoplada para
sincronização futura com o Rivulus (plataforma pedagógica da Academia Gama):
- Sync de alunos e turmas
- Autenticação partilhada
- Partilha de perfis e relatórios

---

**Academia Gama** — Luanda, Angola
