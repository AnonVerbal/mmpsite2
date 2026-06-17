# MMP Construtora e Incorporadora — Site

Site institucional one-page (Next.js 14 + React 18). Pronto para deploy na Vercel.

## Stack
- **Next.js 14** (App Router) — renderização no servidor + metadados de SEO
- **React 18**
- **lucide-react** — ícones
- Dados estruturados `schema.org` (RealEstateAgent) já incluídos no `app/layout.jsx`

## Estrutura
```
mmp-incorporadora/
├── app/
│   ├── globals.css      # reset mínimo
│   ├── layout.jsx       # <head>, metadados, fontes (Google), JSON-LD
│   └── page.jsx         # renderiza o site
├── components/
│   └── MmpSite.jsx      # o site completo (UI + estilos)
├── package.json
├── next.config.mjs
├── jsconfig.json        # alias "@/"
└── .gitignore
```

## Rodar localmente
Pré-requisito: Node.js 18.17+ (recomendado 20 LTS).
```bash
npm install
npm run dev
```
Abra http://localhost:3000

## Deploy na Vercel (passo a passo)
1. Crie um repositório no GitHub e suba os arquivos:
   ```bash
   git init
   git add .
   git commit -m "MMP site inicial"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/mmp-incorporadora.git
   git push -u origin main
   ```
2. Acesse https://vercel.com → **Add New → Project** → importe o repositório.
3. A Vercel detecta **Next.js** automaticamente. Não precisa configurar nada.
   Clique em **Deploy**.
4. Domínio próprio: em **Settings → Domains**, adicione `mmpincorporadora.com.br`
   e aponte o DNS conforme as instruções da Vercel.

## Pendências antes de publicar (TODO)
Marcadas com `// TODO` em `components/MmpSite.jsx`:
- **Obra:** trocar os percentuais (`OBRA_IV`) pelos do cronograma físico-financeiro real.
- **Plantas:** os layouts SVG são esquemas ilustrativos — substituir pelos arquivos reais.
- **Fotos:** hoje carregadas por URL do site antigo (pode haver bloqueio de hotlink).
  Recomendado **hospedar as imagens otimizadas no projeto** (pasta `public/`, formato
  WebP/AVIF) e referenciar localmente.
- **Instagram:** confirmar a URL no rodapé.
- **Valorização:** citar a fonte dos índices (ex.: FipeZAP) na seção "Investir".
- **Formulário:** integrar o envio a um CRM ou à WhatsApp Business API (hoje é protótipo).

## Hospedar imagens localmente (recomendado)
1. Coloque os arquivos em `public/img/` (ex.: `public/img/marcellus-iv.webp`).
2. Em `components/MmpSite.jsx`, troque as URLs do objeto `IMG` por caminhos locais,
   ex.: `dev: "/img/marcellus-iv.webp"`.
