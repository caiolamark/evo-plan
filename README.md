# EVO — Engenharia Visual de Obras

Protótipo SaaS do módulo **Planta Baixa**.

## O que foi alterado
- A planta virou o elemento principal da tela.
- Clique em um apartamento para abrir o planejamento daquele ambiente.
- O painel direito deixou de ficar preso ao apartamento 502: ele é dinâmico.
- A data inicia em 05/10/2026, início do primeiro serviço do exemplo.
- A linha do tempo acompanha o apartamento selecionado.
- A data atual aparece na linha do tempo.
- A planta pode ser visualizada por serviço ou por ambiente.
- Zoom e seleção continuam funcionando.
- O layout foi feito sem Tailwind, usando CSS próprio, para facilitar a publicação.

## Rodar no computador
1. Instale Node.js 20.19+ ou 22.12+.
2. Abra o terminal na pasta deste projeto.
3. Execute:

```bash
npm install
npm run dev
```

4. Abra o endereço que o Vite mostrar, normalmente `http://localhost:5173`.

## Gerar versão de produção

```bash
npm run build
npm run preview
```

A pasta `dist` é a versão pronta para hospedagem.

## Publicar na Vercel usando GitHub

1. Crie uma conta no GitHub.
2. Crie um repositório chamado `evo-saas`.
3. Na pasta do projeto, execute:

```bash
git init
git add .
git commit -m "EVO MVP planta baixa"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/evo-saas.git
git push -u origin main
```

4. Entre na Vercel.
5. Escolha **Add New Project**.
6. Importe o repositório `evo-saas`.
7. A Vercel deve detectar Vite automaticamente.
8. Build Command: `npm run build`.
9. Output Directory: `dist`.
10. Clique em **Deploy**.

Depois disso você terá uma URL pública do EVO.

## Próxima etapa para virar SaaS de verdade

Este projeto ainda é um **MVP visual**: os empreendimentos, apartamentos e cronogramas estão no código.

Para virar produto multiusuário, a próxima camada deve ser:

1. Banco de dados: projetos, torres, pavimentos, ambientes, serviços e planejamentos.
2. Login e usuários.
3. Upload/importação de planta real.
4. Associação dos ambientes da planta aos IDs do banco.
5. CRUD para cadastrar e editar serviços e datas.
6. Controle de permissões por empreendimento.
7. Histórico das alterações de planejamento.
8. Depois, notificações e indicadores.

Não coloque banco/login antes de validar a experiência da planta com alguns usuários. Primeiro valide o fluxo **planta → ambiente → serviço → data**.
