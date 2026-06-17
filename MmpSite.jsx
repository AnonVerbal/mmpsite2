"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Menu, X, MapPin, Phone, Mail, ArrowUpRight, ArrowRight, Check,
  Ruler, BedDouble, Bath, Car, ShieldCheck, Droplets, Sun, Recycle,
  Plug, CloudRain, Building2, TrendingUp, Award, Clock, Quote,
  MessageCircle, ChevronRight, Plus, Minus, Maximize, Compass, Move,
} from "lucide-react";

/*
  MMP CONSTRUTORA E INCORPORADORA — One-page premium (protótipo navegável)
  --------------------------------------------------------------------------
  v2: fotos reais do acervo MMP + visualizador de plantas navegável (zoom/pan/toggle).
  As fotos são carregadas das URLs do site oficial; SmartImage faz fallback gracioso.
  PONTOS A ALIMENTAR COM DADOS REAIS (// TODO):
   - Percentuais de obra (cronograma físico-financeiro real).
   - Plantas: os layouts SVG são ESQUEMAS ilustrativos — substituir pelas plantas reais.
   - URL do Instagram (handle não confirmado na fonte).
   - Índices de valorização da Região dos Lagos (citar fonte ao publicar).
*/

const WA_VISITA = "https://wa.link/0rpkpt";
const WA_GERAL = "https://wa.link/d1pbrj";
const B = "https://mmpincorporadora.com.br/wp-content/uploads";

const IMG = {
  dev: `${B}/2024/05/AnyConv.com__marcelus-IV.webp`,
  gourmet: `${B}/2024/04/Area-de-Lazer_04-scaled.jpg`,
  kids: `${B}/2024/01/Area-de-Lazer_05-scaled.jpg`,
  lounge: `${B}/2024/01/Area-de-Lazer_01-scaled.jpg`,
  sauna: `${B}/2024/01/Area-de-Lazer_07-scaled-e1706732724877.jpg`,
  marcellus3: `${B}/2024/01/image-2-1.jpg`,
  team: `${B}/2024/01/foto-confraternizacao_-2.jpg`,
};

// ----------------------------------------------------------------------------
// Hooks
// ----------------------------------------------------------------------------
function useReveal() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setShown(true); return; }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); obs.disconnect(); } },
      { threshold: 0.18 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, shown];
}

function useCountUp(target, run, dur = 1300) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setVal(target); return; }
    let raf, start;
    const tick = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, target, dur]);
  return val;
}

// ----------------------------------------------------------------------------
// Auxiliares
// ----------------------------------------------------------------------------
function Eyebrow({ children, light }) {
  return (
    <span className={"mmp-eyebrow" + (light ? " is-light" : "")}>
      <span className="mmp-eyebrow-rule" />
      {children}
    </span>
  );
}

function Reveal({ children, delay = 0, as: Tag = "div", className = "" }) {
  const [ref, shown] = useReveal();
  return (
    <Tag ref={ref} className={"mmp-reveal " + (shown ? "is-in " : "") + className}
      style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}

// Imagem com fallback gracioso
function SmartImage({ src, alt, className = "" }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return <div className={"mmp-img-ph " + className} role="img" aria-label={alt} />;
  }
  return (
    <img src={src} alt={alt} className={className} loading="lazy"
      onError={() => setErr(true)} />
  );
}

// Medidor de obra — assinatura
function ObraMeter({ stages }) {
  const [ref, shown] = useReveal();
  const total = Math.round(stages.reduce((a, s) => a + s.pct, 0) / stages.length);
  const count = useCountUp(total, shown);
  return (
    <div className="mmp-obra" ref={ref}>
      <div className="mmp-obra-head">
        <div>
          <span className="mmp-obra-label">Evolução da obra</span>
          <span className="mmp-obra-sub">Atualizado conforme cronograma físico</span>
        </div>
        <div className="mmp-obra-total"><span className="mmp-obra-num">{count}<i>%</i></span></div>
      </div>
      <div className="mmp-obra-list">
        {stages.map((s, i) => (
          <div className="mmp-obra-row" key={s.name}>
            <span className="mmp-obra-name">{s.name}</span>
            <div className="mmp-obra-track">
              <span className="mmp-obra-fill"
                style={{ width: shown ? `${s.pct}%` : "0%", transitionDelay: `${120 + i * 90}ms` }} />
            </div>
            <span className="mmp-obra-pct">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Visualizador de planta navegável (zoom / pan / esquema técnico)
function FloorPlan({ unit }) {
  const [z, setZ] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef(null);
  const svgRef = useRef(null);
  const CX = 120, CY = 84, X0 = 30, Y0 = 24, CW = 45, CH = 40;

  useEffect(() => { setZ(1); setPan({ x: 0, y: 0 }); }, [unit.un]);

  const cell = (c, r, cs, rs) => ({ x: X0 + c * CW, y: Y0 + r * CH, w: cs * CW, h: rs * CH });
  const clampZ = (v) => Math.min(3, Math.max(1, v));
  const zoom = (d) => setZ((cur) => { const n = clampZ(+(cur + d).toFixed(2)); if (n === 1) setPan({ x: 0, y: 0 }); return n; });
  const reset = () => { setZ(1); setPan({ x: 0, y: 0 }); };
  const ratio = () => { const r = svgRef.current?.getBoundingClientRect(); return r ? 240 / r.width : 1; };
  const down = (e) => { if (z <= 1) return; drag.current = { x: e.clientX, y: e.clientY }; e.currentTarget.setPointerCapture?.(e.pointerId); };
  const move = (e) => {
    if (!drag.current) return;
    const k = ratio() / z;
    setPan((p) => ({ x: p.x + (e.clientX - drag.current.x) * k, y: p.y + (e.clientY - drag.current.y) * k }));
    drag.current = { x: e.clientX, y: e.clientY };
  };
  const up = () => { drag.current = null; };
  const tr = `translate(${pan.x} ${pan.y}) translate(${CX} ${CY}) scale(${z}) translate(${-CX} ${-CY})`;

  return (
    <div className="mmp-fp">
      <div className="mmp-fp-stage">
        <svg ref={svgRef} viewBox="0 0 240 168" className={"mmp-fp-svg" + (z > 1 ? " is-grab" : "")}
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}>
          <defs>
            <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="var(--line-2)" strokeWidth="1" />
            </pattern>
          </defs>
          <g transform={tr}>
            {unit.plan.map((rm, i) => {
              const b = cell(rm.c, rm.r, rm.cs, rm.rs);
              return (
                <g key={i}>
                  <rect x={b.x} y={b.y} width={b.w} height={b.h}
                    fill={rm.balcony ? "url(#hatch)" : "#FCFBF8"} stroke="var(--petrol)" strokeWidth="1.4" />
                  <text x={b.x + b.w / 2} y={b.y + b.h / 2} className="mmp-fp-lbl"
                    textAnchor="middle" dominantBaseline="middle">{rm.label}</text>
                </g>
              );
            })}
            {/* parede externa */}
            <rect x={X0} y={Y0} width={CW * 4} height={CH * 3} fill="none" stroke="var(--petrol)" strokeWidth="3.4" />
            {/* porta de entrada */}
            <path d={`M ${X0 + CW * 4} ${Y0 + CH * 3 - 26} A 26 26 0 0 1 ${X0 + CW * 4 - 26} ${Y0 + CH * 3}`}
              fill="none" stroke="var(--bronze)" strokeWidth="1.2" />
            <line x1={X0 + CW * 4} y1={Y0 + CH * 3 - 26} x2={X0 + CW * 4} y2={Y0 + CH * 3} stroke="#FCFBF8" strokeWidth="4" />
          </g>
          {/* rosa dos ventos */}
          <g className="mmp-fp-aux" transform="translate(222 22)">
            <line x1="0" y1="7" x2="0" y2="-7" stroke="var(--muted)" strokeWidth="1" />
            <path d="M0 -9 L2.6 -3 L-2.6 -3 Z" fill="var(--bronze)" />
            <text x="0" y="15" textAnchor="middle" className="mmp-fp-n">N</text>
          </g>
          {/* barra de escala */}
          <g className="mmp-fp-aux" transform="translate(30 160)">
            <line x1="0" y1="0" x2="40" y2="0" stroke="var(--muted)" strokeWidth="1" />
            <line x1="0" y1="-3" x2="0" y2="3" stroke="var(--muted)" strokeWidth="1" />
            <line x1="40" y1="-3" x2="40" y2="3" stroke="var(--muted)" strokeWidth="1" />
            <text x="44" y="3" className="mmp-fp-scale">5 m</text>
          </g>
        </svg>

        <div className="mmp-fp-ctrl">
          <button onClick={() => zoom(0.5)} aria-label="Aproximar"><Plus size={16} /></button>
          <button onClick={() => zoom(-0.5)} aria-label="Afastar" disabled={z <= 1}><Minus size={16} /></button>
          <button onClick={reset} aria-label="Reiniciar" disabled={z === 1 && pan.x === 0 && pan.y === 0}><Maximize size={15} /></button>
        </div>
        <span className="mmp-fp-hint">
          {z > 1 ? <><Move size={12} /> arraste para mover</> : <><Compass size={12} /> esquema ilustrativo</>}
        </span>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Dados
// ----------------------------------------------------------------------------
const TIPOLOGIAS = [
  {
    un: "01", dorm: 3, suites: 2, vagas: 1, area: "≈ 90 m²",
    desc: "3 quartos (2 suítes), cozinha americana, banheiro social, varanda e área de serviço.",
    plan: [
      { c: 0, r: 0, cs: 2, rs: 1, label: "Suíte 1" },
      { c: 0, r: 1, cs: 2, rs: 1, label: "Suíte 2" },
      { c: 0, r: 2, cs: 2, rs: 1, label: "Quarto" },
      { c: 2, r: 0, cs: 2, rs: 2, label: "Sala / jantar" },
      { c: 2, r: 2, cs: 1, rs: 1, label: "Cozinha" },
      { c: 3, r: 2, cs: 1, rs: 1, label: "Serviço" },
    ],
  },
  {
    un: "02", dorm: 2, suites: 2, vagas: 1, area: "≈ 78 m²",
    desc: "2 suítes, banheiro social, cozinha americana, sala de estar, varanda e área de serviço.",
    plan: [
      { c: 0, r: 0, cs: 2, rs: 1, label: "Suíte 1" },
      { c: 0, r: 1, cs: 2, rs: 1, label: "Suíte 2" },
      { c: 0, r: 2, cs: 2, rs: 1, label: "BWC social" },
      { c: 2, r: 0, cs: 2, rs: 1, label: "Sala / jantar" },
      { c: 2, r: 1, cs: 2, rs: 1, label: "Cozinha" },
      { c: 2, r: 2, cs: 2, rs: 1, label: "Varanda", balcony: true },
    ],
  },
  {
    un: "03", dorm: 2, suites: 1, vagas: 1, area: "≈ 70 m²",
    desc: "1 suíte, banheiro social, cozinha, varanda e área de serviço.",
    plan: [
      { c: 0, r: 0, cs: 2, rs: 1, label: "Suíte" },
      { c: 0, r: 1, cs: 2, rs: 1, label: "Quarto" },
      { c: 0, r: 2, cs: 1, rs: 1, label: "Cozinha" },
      { c: 1, r: 2, cs: 1, rs: 1, label: "BWC" },
      { c: 2, r: 0, cs: 2, rs: 2, label: "Sala / jantar" },
      { c: 2, r: 2, cs: 2, rs: 1, label: "Varanda", balcony: true },
    ],
  },
  {
    un: "04", dorm: 1, suites: 1, vagas: 1, area: "68,26 m²",
    desc: "1 suíte, banheiro social, cozinha, varanda e área de serviço.",
    plan: [
      { c: 0, r: 0, cs: 2, rs: 1, label: "Suíte" },
      { c: 0, r: 1, cs: 2, rs: 1, label: "Cozinha" },
      { c: 0, r: 2, cs: 1, rs: 1, label: "BWC" },
      { c: 1, r: 2, cs: 1, rs: 1, label: "Serviço" },
      { c: 2, r: 0, cs: 2, rs: 2, label: "Sala / jantar" },
      { c: 2, r: 2, cs: 2, rs: 1, label: "Varanda", balcony: true },
    ],
  },
];

const OBRA_IV = [ // TODO: cronograma real
  { name: "Fundação", pct: 100 },
  { name: "Estrutura", pct: 45 },
  { name: "Alvenaria", pct: 15 },
  { name: "Acab. externo", pct: 0 },
  { name: "Acab. interno", pct: 0 },
];

const GALERIA = [
  { nome: "Área gourmet", img: IMG.gourmet },
  { nome: "Área kids", img: IMG.kids },
  { nome: "Lounge", img: IMG.lounge },
  { nome: "Sauna", img: IMG.sauna },
];

const ESG = [
  { icon: CloudRain, t: "Captação de água da chuva" },
  { icon: Droplets, t: "Reúso de águas" },
  { icon: Sun, t: "Painéis solares" },
  { icon: Plug, t: "Vagas para carros elétricos" },
  { icon: Recycle, t: "Separação de resíduos" },
];

const PORTFOLIO = [
  { nome: "Marcellus III", status: "Vendido · em obras", obra: 80, img: IMG.marcellus3, txt: "Área nobre do Nova São Pedro, ao lado dos condomínios Blue Garden e Viverde. 6 unidades de 2 e 3 quartos." },
  { nome: "Marcellus II", status: "100% vendido", obra: 100, img: null, txt: "Apartamentos amplos em bairro consolidado de São Pedro da Aldeia." },
  { nome: "Marcellus I", status: "100% vendido", obra: 100, img: null, txt: "O primeiro da linha: o conforto de viver em um bairro nobre da cidade." },
];

const DIFERENCIAIS = [
  { icon: ShieldCheck, t: "Segurança", d: "Condomínio fechado com portaria e controle de acesso." },
  { icon: Building2, t: "Engenharia de alto padrão", d: "Projetos executados com fino acabamento e desempenho." },
  { icon: Award, t: "Qualidade", d: "Padrão construtivo verificado etapa a etapa." },
  { icon: Sun, t: "Edifício inteligente", d: "Tecnologia para eficiência energética e conforto." },
];

const STATS = [
  { n: 12, suf: "+", l: "anos de experiência" },
  { n: 4, suf: "", l: "empreendimentos da linha Marcellus" },
  { n: 3, suf: "", l: "residenciais 100% vendidos" },
  { n: 100, suf: "%", l: "foco na Região dos Lagos" },
];

const DEPOIMENTOS = [ // TODO: depoimentos reais com autorização
  { txt: "Acompanhar a obra de perto e ver o cronograma sendo cumprido passou muita segurança na hora de comprar na planta.", a: "Proprietário, Marcellus III" },
  { txt: "Atendimento direto e transparente. Comprei o apartamento confiando na entrega — e a MMP entregou.", a: "Proprietária, Marcellus II" },
];

const INTENCOES = ["Saber valores", "Falar com corretor", "Simular financiamento", "Falar sobre reforma"];

// ----------------------------------------------------------------------------
// Seção empreendimento (estado da tipologia selecionada)
// ----------------------------------------------------------------------------
function EmpreendimentoSection() {
  const [sel, setSel] = useState(3); // Unidade 04 por padrão (disponível)
  const u = TIPOLOGIAS[sel];
  return (
    <section className="mmp-section" id="empreendimentos">
      <div className="mmp-container">
        <Reveal className="mmp-sec-head">
          <Eyebrow>Em foco · Marcellus IV</Eyebrow>
          <h2 className="mmp-h2">Seu próximo endereço na área nobre do Nova São Pedro</h2>
          <p className="mmp-sec-sub">
            Um condomínio completo, com segurança, lazer e a tranquilidade de quem busca
            qualidade de vida na Região dos Lagos.
          </p>
        </Reveal>

        <div className="mmp-focus-grid">
          <Reveal className="mmp-plan-panel">
            <div className="mmp-unit-tabs" role="tablist">
              {TIPOLOGIAS.map((t, i) => (
                <button key={t.un} role="tab" aria-selected={sel === i}
                  className={"mmp-unit-tab" + (sel === i ? " is-on" : "")}
                  onClick={() => setSel(i)}>Un {t.un}</button>
              ))}
            </div>
            <FloorPlan unit={u} />
          </Reveal>

          <Reveal className="mmp-unit-info" delay={100}>
            <span className="mmp-mini-label">Unidade {u.un}</span>
            <span className="mmp-unit-area">{u.area}</span>
            <div className="mmp-unit-specs">
              <span><BedDouble size={16} /> {u.dorm} dorm.</span>
              <span><Bath size={16} /> {u.suites} suíte{u.suites > 1 ? "s" : ""}</span>
              <span><Car size={16} /> {u.vagas} vaga</span>
            </div>
            <p className="mmp-unit-desc">{u.desc}</p>
            <a className="mmp-btn mmp-btn-primary mmp-full" href={WA_VISITA} target="_blank" rel="noreferrer">
              Quero conhecer esta unidade <ArrowUpRight size={16} />
            </a>
            <ObraMeter stages={OBRA_IV} />
          </Reveal>
        </div>

        {/* Galeria de lazer — fotos reais */}
        <Reveal className="mmp-gallery-head">
          <span className="mmp-mini-label">Lazer & estrutura</span>
          <p>Além de área gourmet, kids, lounge e sauna, o condomínio conta com piscina e portaria 24h.</p>
        </Reveal>
        <div className="mmp-gallery">
          {GALERIA.map((g, i) => (
            <Reveal key={g.nome} delay={i * 70} className="mmp-gal-tile">
              <SmartImage src={g.img} alt={g.nome} className="mmp-gal-img" />
              <span className="mmp-gal-name">{g.nome}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------
// App
// ----------------------------------------------------------------------------
export default function MmpSite() {
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", whats: "", intencao: INTENCOES[0], msg: "", lgpd: false });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id) => { setMenu(false); document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const submit = () => { if (!form.nome || !form.whats || !form.lgpd) return; setSent(true); };

  const nav = [
    ["Empreendimentos", "empreendimentos"],
    ["Diferenciais", "diferenciais"],
    ["Investir", "investir"],
    ["A MMP", "sobre"],
    ["Contato", "contato"],
  ];

  return (
    <div className="mmp-root">
      <style>{CSS}</style>

      <header className={"mmp-header" + (scrolled ? " is-scrolled" : "")}>
        <div className="mmp-container mmp-header-in">
          <a className="mmp-logo" onClick={() => go("topo")} href="#topo">
            <span className="mmp-logo-mark">MMP</span>
            <span className="mmp-logo-sub">Construtora · Incorporadora</span>
          </a>
          <nav className="mmp-nav-desk">
            {nav.map(([l, id]) => <button key={id} onClick={() => go(id)}>{l}</button>)}
          </nav>
          <a className="mmp-btn mmp-btn-primary mmp-nav-cta" href={WA_GERAL} target="_blank" rel="noreferrer">
            Falar com a MMP <ArrowUpRight size={16} />
          </a>
          <button className="mmp-burger" onClick={() => setMenu(true)} aria-label="Abrir menu"><Menu size={22} /></button>
        </div>
      </header>

      <div className={"mmp-drawer" + (menu ? " is-open" : "")}>
        <div className="mmp-drawer-top">
          <span className="mmp-logo-mark">MMP</span>
          <button onClick={() => setMenu(false)} aria-label="Fechar menu"><X size={24} /></button>
        </div>
        <nav className="mmp-drawer-nav">
          {nav.map(([l, id]) => <button key={id} onClick={() => go(id)}>{l} <ChevronRight size={18} /></button>)}
        </nav>
        <a className="mmp-btn mmp-btn-primary mmp-drawer-cta" href={WA_GERAL} target="_blank" rel="noreferrer">
          Falar com a MMP <ArrowUpRight size={16} />
        </a>
      </div>
      {menu && <div className="mmp-overlay" onClick={() => setMenu(false)} />}

      {/* HERO */}
      <section className="mmp-hero" id="topo">
        <div className="mmp-hero-grid" aria-hidden="true" />
        <div className="mmp-container mmp-hero-in">
          <Reveal className="mmp-hero-copy">
            <Eyebrow>São Pedro da Aldeia · Região dos Lagos</Eyebrow>
            <h1 className="mmp-h1">Engenharia de alto padrão para quem mora <em>e</em> para quem investe.</h1>
            <p className="mmp-lead">
              Há mais de 12 anos a MMP constrói residenciais que entregam o que prometem.
              Conheça o <strong>Marcellus IV</strong> — na planta, na área nobre do Nova São Pedro.
            </p>
            <div className="mmp-hero-cta">
              <button className="mmp-btn mmp-btn-primary" onClick={() => go("empreendimentos")}>
                Ver empreendimentos <ArrowRight size={16} />
              </button>
              <button className="mmp-btn mmp-btn-ghost" onClick={() => go("investir")}>Por que investir aqui</button>
            </div>
          </Reveal>

          <Reveal className="mmp-hero-card" delay={120}>
            <div className="mmp-hero-card-tag">Em lançamento</div>
            <SmartImage src={IMG.dev} alt="Residencial Marcellus IV" className="mmp-hero-img" />
            <h3 className="mmp-hero-card-title">Residencial Marcellus IV</h3>
            <p className="mmp-hero-card-txt">
              Apartamentos de 1 a 3 dormitórios, lazer completo e edifício inteligente
              com soluções sustentáveis.
            </p>
            <div className="mmp-hero-card-meta">
              <span><Ruler size={15} /> 68 – 90 m²</span>
              <span><BedDouble size={15} /> 1–3 dorm.</span>
              <span><Car size={15} /> 1 vaga</span>
            </div>
            <a className="mmp-btn mmp-btn-primary mmp-full" href={WA_VISITA} target="_blank" rel="noreferrer">
              Agendar visita <ArrowUpRight size={16} />
            </a>
          </Reveal>
        </div>
      </section>

      {/* STATS */}
      <section className="mmp-stats">
        <div className="mmp-container mmp-stats-grid">
          {STATS.map((s, i) => <StatItem key={i} {...s} />)}
        </div>
      </section>

      {/* EMPREENDIMENTO */}
      <EmpreendimentoSection />

      {/* DIFERENCIAIS + ESG */}
      <section className="mmp-section mmp-section-alt" id="diferenciais">
        <div className="mmp-container">
          <Reveal className="mmp-sec-head">
            <Eyebrow>Diferenciais construtivos</Eyebrow>
            <h2 className="mmp-h2">Solidez na engenharia, responsabilidade no projeto</h2>
          </Reveal>
          <div className="mmp-dif-grid">
            {DIFERENCIAIS.map((d, i) => (
              <Reveal key={d.t} delay={i * 70} className="mmp-dif-card">
                <d.icon size={24} strokeWidth={1.6} />
                <h3>{d.t}</h3>
                <p>{d.d}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="mmp-esg">
            <div className="mmp-esg-head">
              <Eyebrow>Sustentabilidade & inteligência</Eyebrow>
              <h3 className="mmp-h3">Um edifício preparado para o futuro</h3>
              <p>O Marcellus IV incorpora tecnologias que reduzem o custo de operação do
                condomínio e o impacto ambiental — um diferencial que protege o seu investimento.</p>
            </div>
            <div className="mmp-esg-grid">
              {ESG.map((e) => (
                <div key={e.t} className="mmp-esg-item"><e.icon size={20} strokeWidth={1.6} /><span>{e.t}</span></div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* INVESTIR */}
      <section className="mmp-invest" id="investir">
        <div className="mmp-container mmp-invest-in">
          <Reveal className="mmp-invest-copy">
            <Eyebrow light>Tese de investimento · Região dos Lagos</Eyebrow>
            <h2 className="mmp-h2 is-light">Comprar bem em São Pedro da Aldeia é decisão de quem pensa no longo prazo</h2>
            <p>Litoral consolidado, vocação para moradia e locação por temporada e infraestrutura
              em expansão. Comprar na planta da MMP combina ticket de entrada competitivo com
              potencial de valorização ao longo da obra.</p>
            <ul className="mmp-invest-list">
              <li><TrendingUp size={18} /> Ganho potencial entre a compra na planta e a entrega</li>
              <li><Building2 size={18} /> Demanda dupla: moradia fixa e renda de temporada</li>
              <li><ShieldCheck size={18} /> Construtora com histórico de entregas na região</li>
            </ul>
            <a className="mmp-btn mmp-btn-bronze" href={WA_GERAL} target="_blank" rel="noreferrer">
              Solicitar tabela de valores <ArrowUpRight size={16} />
            </a>
            <p className="mmp-invest-note">Projeções de valorização variam por unidade e momento de mercado.</p>
          </Reveal>
          <Reveal className="mmp-invest-panel" delay={120}>
            <span className="mmp-mini-label is-light">Por que a Região dos Lagos</span>
            <div className="mmp-invest-rows">
              <div><span>Perfil</span><strong>Litoral · turismo</strong></div>
              <div><span>Uso</span><strong>Moradia + temporada</strong></div>
              <div><span>Entrada</span><strong>Compra na planta</strong></div>
              <div><span>Vizinhança</span><strong>Blue Garden · Viverde</strong></div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PORTFÓLIO */}
      <section className="mmp-section">
        <div className="mmp-container">
          <Reveal className="mmp-sec-head">
            <Eyebrow>Histórico de entregas</Eyebrow>
            <h2 className="mmp-h2">A linha Marcellus, do primeiro ao mais recente</h2>
            <p className="mmp-sec-sub">Três residenciais 100% vendidos são a prova de que projeto, obra e entrega caminham juntos.</p>
          </Reveal>
          <div className="mmp-port-grid">
            {PORTFOLIO.map((p, i) => (
              <Reveal key={p.nome} delay={i * 80} className="mmp-port-card">
                <SmartImage src={p.img} alt={p.nome} className="mmp-port-img" />
                <div className="mmp-port-body">
                  <div className="mmp-port-top">
                    <h3>{p.nome}</h3>
                    <span className={"mmp-badge" + (p.obra === 100 ? " is-done" : "")}>{p.status}</span>
                  </div>
                  <p>{p.txt}</p>
                  <div className="mmp-port-bar"><span style={{ width: `${p.obra}%` }} /></div>
                  <span className="mmp-port-pct">{p.obra}% concluído</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section className="mmp-section mmp-section-alt" id="sobre">
        <div className="mmp-container mmp-about">
          <Reveal className="mmp-about-copy">
            <Eyebrow>A MMP</Eyebrow>
            <h2 className="mmp-h2">Cada obra reflete nosso compromisso com inovação e qualidade</h2>
            <p>Em mais de 12 anos, a MMP evoluiu de pequenas reformas a incorporadora de
              referência na Região dos Lagos. Construímos com dedicação e excelência,
              buscando superar a expectativa de cada cliente.</p>
            <p>Nossa visão é contribuir para um cenário urbano transformador, criando valor
              duradouro para clientes e para a cidade.</p>
            <div className="mmp-about-seals">
              <span><ShieldCheck size={16} /> Memorial descritivo registrado</span>
              <span><Award size={16} /> Padrão de desempenho construtivo</span>
              <span><Clock size={16} /> Histórico de entregas</span>
            </div>
          </Reveal>
          <Reveal className="mmp-about-side" delay={120}>
            <SmartImage src={IMG.team} alt="Equipe MMP" className="mmp-about-img" />
            {DEPOIMENTOS.map((d, i) => (
              <div key={i} className="mmp-quote">
                <Quote size={20} className="mmp-quote-icon" />
                <p>{d.txt}</p>
                <span>{d.a}</span>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* CONTATO */}
      <section className="mmp-section" id="contato">
        <div className="mmp-container mmp-contact">
          <Reveal className="mmp-contact-copy">
            <Eyebrow>Fale conosco</Eyebrow>
            <h2 className="mmp-h2">Vamos encontrar o seu próximo endereço</h2>
            <p className="mmp-sec-sub">Dúvidas, valores, financiamento ou visita: responda em poucos campos e a equipe retorna.</p>
            <div className="mmp-contact-info">
              <a href="tel:+5522974014736"><Phone size={17} /> (22) 97401-4736</a>
              <a href="mailto:Pedro.comercial@mmpincorporadora.com"><Mail size={17} /> Pedro.comercial@mmpincorporadora.com</a>
              <span><MapPin size={17} /> Av. Hum, Lote 01, Quadra 13 — Nova São Pedro, São Pedro da Aldeia · CEP 28940-840</span>
            </div>
          </Reveal>

          <Reveal className="mmp-form" delay={120}>
            {sent ? (
              <div className="mmp-form-ok">
                <div className="mmp-form-ok-mark"><Check size={28} /></div>
                <h3>Recebemos o seu contato</h3>
                <p>A equipe comercial da MMP retorna pelo WhatsApp informado. Prefere conversar agora?</p>
                <a className="mmp-btn mmp-btn-primary" href={WA_GERAL} target="_blank" rel="noreferrer">
                  Abrir WhatsApp <ArrowUpRight size={16} />
                </a>
              </div>
            ) : (
              <>
                <div className="mmp-field">
                  <label>Nome</label>
                  <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Seu nome completo" />
                </div>
                <div className="mmp-field-row">
                  <div className="mmp-field">
                    <label>WhatsApp</label>
                    <input value={form.whats} onChange={(e) => setForm({ ...form, whats: e.target.value })} placeholder="(22) 90000-0000" />
                  </div>
                  <div className="mmp-field">
                    <label>E-mail</label>
                    <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="voce@email.com" />
                  </div>
                </div>
                <div className="mmp-field">
                  <label>O que você procura</label>
                  <div className="mmp-intent">
                    {INTENCOES.map((i) => (
                      <button key={i} type="button"
                        className={"mmp-intent-btn" + (form.intencao === i ? " is-on" : "")}
                        onClick={() => setForm({ ...form, intencao: i })}>{i}</button>
                    ))}
                  </div>
                </div>
                <div className="mmp-field">
                  <label>Mensagem (opcional)</label>
                  <textarea rows={3} value={form.msg} onChange={(e) => setForm({ ...form, msg: e.target.value })} placeholder="Conte o que precisa" />
                </div>
                <label className="mmp-lgpd">
                  <input type="checkbox" checked={form.lgpd} onChange={(e) => setForm({ ...form, lgpd: e.target.checked })} />
                  <span>Autorizo o contato da MMP e o uso dos meus dados conforme a Política de Privacidade (LGPD).</span>
                </label>
                <button className="mmp-btn mmp-btn-primary mmp-full" onClick={submit}
                  disabled={!form.nome || !form.whats || !form.lgpd}>
                  Enviar contato <ArrowRight size={16} />
                </button>
              </>
            )}
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mmp-footer">
        <div className="mmp-container mmp-footer-grid">
          <div>
            <span className="mmp-logo-mark is-light">MMP</span>
            <p className="mmp-footer-tag">Construtora e Incorporadora · São Pedro da Aldeia · Região dos Lagos</p>
          </div>
          <div className="mmp-footer-col">
            <span>Navegação</span>
            {nav.map(([l, id]) => <button key={id} onClick={() => go(id)}>{l}</button>)}
          </div>
          <div className="mmp-footer-col">
            <span>Contato</span>
            <a href="tel:+5522974014736">(22) 97401-4736</a>
            <a href="mailto:Pedro.comercial@mmpincorporadora.com">Pedro.comercial@mmpincorporadora.com</a>
            <a href="https://mmpincorporadora.com.br/politica-de-privacidade/" target="_blank" rel="noreferrer">Política de Privacidade</a>
          </div>
          <div className="mmp-footer-col">
            <span>Redes</span>
            <a href="https://www.tiktok.com/@mmpconstrutora" target="_blank" rel="noreferrer">TikTok</a>
            <a href="https://www.linkedin.com/company/mmpconstrutora" target="_blank" rel="noreferrer">LinkedIn</a>
            <a href={WA_GERAL} target="_blank" rel="noreferrer">WhatsApp</a>
          </div>
        </div>
        <div className="mmp-container mmp-footer-base">
          <span>© {new Date().getFullYear()} MMP Construtora. Todos os direitos reservados.</span>
        </div>
      </footer>

      <a className="mmp-wa-float" href={WA_GERAL} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={26} /></a>
    </div>
  );
}

function StatItem({ n, suf, l }) {
  const [ref, shown] = useReveal();
  const v = useCountUp(n, shown);
  return (
    <div className="mmp-stat" ref={ref}>
      <span className="mmp-stat-num">{v}{suf}</span>
      <span className="mmp-stat-label">{l}</span>
    </div>
  );
}

// ----------------------------------------------------------------------------
// CSS
// ----------------------------------------------------------------------------
const CSS = `

.mmp-root{
  --petrol:#103A41; --petrol-2:#0B2A30; --bronze:#B68A4E; --green:#2E7D74;
  --canvas:#FAF9F6; --card:#FFFFFF; --line:#EAE7E0; --line-2:#DAD6CC;
  --ink:#14201E; --muted:#5E6B68;
  font-family:'Manrope',system-ui,sans-serif; color:var(--ink);
  background:var(--canvas); line-height:1.55; -webkit-font-smoothing:antialiased; overflow-x:hidden;
}
.mmp-root *{box-sizing:border-box; margin:0; padding:0;}
.mmp-container{width:100%; max-width:1180px; margin:0 auto; padding:0 22px;}

.mmp-h1{font-family:'Fraunces',serif; font-weight:500; font-size:clamp(2rem,6vw,3.6rem); line-height:1.05; letter-spacing:-.01em;}
.mmp-h1 em{font-style:italic; color:var(--bronze);}
.mmp-h2{font-family:'Fraunces',serif; font-weight:500; font-size:clamp(1.6rem,4vw,2.5rem); line-height:1.1; letter-spacing:-.01em;}
.mmp-h2.is-light{color:#fff;}
.mmp-h3{font-family:'Fraunces',serif; font-weight:500; font-size:clamp(1.3rem,3vw,1.7rem);}
.mmp-lead{font-size:clamp(1rem,1.5vw,1.12rem); color:var(--muted); margin-top:18px; max-width:34ch;}
.mmp-lead strong{color:var(--ink); font-weight:600;}

.mmp-eyebrow{display:inline-flex; align-items:center; gap:10px; font-size:.72rem; text-transform:uppercase; letter-spacing:.16em; font-weight:600; color:var(--bronze);}
.mmp-eyebrow-rule{width:28px; height:1px; background:var(--bronze); display:inline-block;}

.mmp-btn{display:inline-flex; align-items:center; justify-content:center; gap:8px; font-family:'Manrope'; font-weight:600; font-size:.95rem; cursor:pointer; border:1px solid transparent; border-radius:12px; padding:14px 22px; min-height:50px; transition:transform .2s ease, background .2s ease, box-shadow .2s ease, color .2s; text-decoration:none;}
.mmp-btn-primary{background:var(--petrol); color:#fff;}
.mmp-btn-primary:hover{background:var(--petrol-2); transform:translateY(-2px); box-shadow:0 10px 24px rgba(16,58,65,.22);}
.mmp-btn-primary:disabled{opacity:.4; cursor:not-allowed; transform:none; box-shadow:none;}
.mmp-btn-ghost{background:transparent; color:var(--petrol); border-color:var(--line-2);}
.mmp-btn-ghost:hover{border-color:var(--petrol); transform:translateY(-2px);}
.mmp-btn-bronze{background:var(--bronze); color:#1a1207;}
.mmp-btn-bronze:hover{transform:translateY(-2px); box-shadow:0 10px 24px rgba(182,138,78,.3);}
.mmp-full{width:100%;}

.mmp-reveal{opacity:0; transform:translateY(22px); transition:opacity .7s ease, transform .7s ease;}
.mmp-reveal.is-in{opacity:1; transform:none;}

/* Imagem placeholder */
.mmp-img-ph{background:linear-gradient(135deg,#e9e6df,#f3f1ec); position:relative;}
.mmp-img-ph::after{content:''; position:absolute; inset:0; background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px); background-size:22px 22px; opacity:.5;}

/* Header */
.mmp-header{position:fixed; top:0; left:0; right:0; z-index:50; transition:background .3s, box-shadow .3s, border-color .3s; border-bottom:1px solid transparent;}
.mmp-header.is-scrolled{background:rgba(250,249,246,.88); backdrop-filter:blur(12px); border-bottom:1px solid var(--line);}
.mmp-header-in{display:flex; align-items:center; justify-content:space-between; height:72px;}
.mmp-logo{display:flex; flex-direction:column; line-height:1; text-decoration:none; cursor:pointer;}
.mmp-logo-mark{font-family:'Fraunces',serif; font-weight:600; font-size:1.5rem; color:var(--petrol); letter-spacing:.04em;}
.mmp-logo-mark.is-light{color:#fff;}
.mmp-logo-sub{font-size:.62rem; text-transform:uppercase; letter-spacing:.18em; color:var(--muted); margin-top:3px;}
.mmp-nav-desk{display:none; gap:30px;}
.mmp-nav-desk button{background:none; border:none; font-family:'Manrope'; font-weight:500; font-size:.92rem; color:var(--ink); cursor:pointer; position:relative; padding:4px 0;}
.mmp-nav-desk button::after{content:''; position:absolute; left:0; bottom:-2px; width:0; height:1.5px; background:var(--bronze); transition:width .25s;}
.mmp-nav-desk button:hover::after{width:100%;}
.mmp-nav-cta{display:none;}
.mmp-burger{display:flex; background:none; border:none; color:var(--petrol); cursor:pointer; padding:6px;}

.mmp-drawer{position:fixed; top:0; right:0; bottom:0; width:84%; max-width:340px; background:var(--card); z-index:70; transform:translateX(100%); transition:transform .35s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; padding:22px; box-shadow:-20px 0 50px rgba(0,0,0,.12);}
.mmp-drawer.is-open{transform:translateX(0);}
.mmp-drawer-top{display:flex; align-items:center; justify-content:space-between; margin-bottom:30px;}
.mmp-drawer-top button{background:none; border:none; color:var(--ink); cursor:pointer;}
.mmp-drawer-nav{display:flex; flex-direction:column; gap:4px; flex:1;}
.mmp-drawer-nav button{display:flex; align-items:center; justify-content:space-between; background:none; border:none; border-bottom:1px solid var(--line); font-family:'Fraunces',serif; font-size:1.25rem; color:var(--ink); padding:16px 4px; cursor:pointer; text-align:left;}
.mmp-drawer-nav button:hover{color:var(--petrol);}
.mmp-drawer-cta{margin-top:20px;}
.mmp-overlay{position:fixed; inset:0; background:rgba(16,32,30,.4); z-index:60;}

/* Hero */
.mmp-hero{position:relative; padding:128px 0 70px; overflow:hidden; background:linear-gradient(180deg,#fff 0%,var(--canvas) 100%);}
.mmp-hero-grid{position:absolute; inset:0; opacity:.5; background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px); background-size:46px 46px; mask-image:radial-gradient(circle at 70% 25%,#000,transparent 70%); -webkit-mask-image:radial-gradient(circle at 70% 25%,#000,transparent 70%);}
.mmp-hero-in{position:relative; display:grid; grid-template-columns:1fr; gap:42px; align-items:center;}
.mmp-hero-cta{display:flex; flex-wrap:wrap; gap:12px; margin-top:30px;}
.mmp-hero-card{background:var(--card); border:1px solid var(--line); border-radius:18px; padding:18px; box-shadow:0 24px 60px -28px rgba(16,58,65,.3); position:relative;}
.mmp-hero-card-tag{position:absolute; top:-12px; left:26px; z-index:2; background:var(--bronze); color:#1a1207; font-size:.68rem; font-weight:700; text-transform:uppercase; letter-spacing:.12em; padding:6px 12px; border-radius:7px;}
.mmp-hero-img{width:100%; height:200px; object-fit:cover; border-radius:12px; display:block; margin-bottom:16px;}
.mmp-hero-card-title{font-family:'Fraunces',serif; font-weight:500; font-size:1.4rem; padding:0 8px;}
.mmp-hero-card-txt{color:var(--muted); font-size:.92rem; margin:8px 0 16px; padding:0 8px;}
.mmp-hero-card-meta{display:flex; flex-wrap:wrap; gap:14px; padding:14px 8px; margin-bottom:16px; border-top:1px solid var(--line); border-bottom:1px solid var(--line);}
.mmp-hero-card-meta span{display:inline-flex; align-items:center; gap:6px; font-size:.82rem; font-weight:500;}
.mmp-hero-card-meta svg{color:var(--bronze);}

/* Stats */
.mmp-stats{background:var(--petrol); color:#fff;}
.mmp-stats-grid{display:grid; grid-template-columns:repeat(2,1fr); gap:30px 18px; padding:42px 22px;}
.mmp-stat{display:flex; flex-direction:column; gap:6px;}
.mmp-stat-num{font-family:'Fraunces',serif; font-weight:500; font-size:clamp(2rem,6vw,2.8rem); color:#fff; line-height:1;}
.mmp-stat-label{font-size:.82rem; color:rgba(255,255,255,.7); max-width:18ch;}

/* Sections */
.mmp-section{padding:72px 0;}
.mmp-section-alt{background:#fff; border-top:1px solid var(--line); border-bottom:1px solid var(--line);}
.mmp-sec-head{max-width:42ch; margin-bottom:42px; display:flex; flex-direction:column; gap:16px;}
.mmp-sec-sub{color:var(--muted); font-size:1rem;}
.mmp-mini-label{display:block; font-size:.72rem; text-transform:uppercase; letter-spacing:.14em; font-weight:600; color:var(--muted);}
.mmp-mini-label.is-light{color:rgba(255,255,255,.6);}

/* Foco / plantas */
.mmp-focus-grid{display:grid; grid-template-columns:1fr; gap:24px; margin-bottom:56px;}
.mmp-plan-panel{background:var(--card); border:1px solid var(--line); border-radius:18px; padding:18px; box-shadow:0 18px 50px -34px rgba(16,58,65,.4);}
.mmp-unit-tabs{display:grid; grid-template-columns:repeat(4,1fr); gap:6px; background:var(--canvas); border:1px solid var(--line); border-radius:12px; padding:5px; margin-bottom:16px;}
.mmp-unit-tab{font-family:'Manrope'; font-weight:600; font-size:.85rem; cursor:pointer; background:none; border:none; border-radius:8px; padding:10px 4px; color:var(--muted); transition:all .2s;}
.mmp-unit-tab.is-on{background:var(--petrol); color:#fff;}

.mmp-fp-stage{position:relative; background:var(--canvas); border:1px solid var(--line); border-radius:12px; overflow:hidden;}
.mmp-fp-svg{display:block; width:100%; height:auto; touch-action:none; cursor:default;}
.mmp-fp-svg.is-grab{cursor:grab;}
.mmp-fp-svg.is-grab:active{cursor:grabbing;}
.mmp-fp-lbl{font-family:'Manrope',sans-serif; font-size:7px; font-weight:600; fill:var(--muted); letter-spacing:.02em;}
.mmp-fp-aux text{font-family:'Manrope',sans-serif;}
.mmp-fp-n{font-size:8px; font-weight:700; fill:var(--muted);}
.mmp-fp-scale{font-size:7px; fill:var(--muted);}
.mmp-fp-ctrl{position:absolute; top:12px; right:12px; display:flex; flex-direction:column; gap:6px;}
.mmp-fp-ctrl button{width:34px; height:34px; display:flex; align-items:center; justify-content:center; background:var(--card); border:1px solid var(--line); border-radius:9px; color:var(--petrol); cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,.06); transition:all .2s;}
.mmp-fp-ctrl button:hover:not(:disabled){background:var(--petrol); color:#fff;}
.mmp-fp-ctrl button:disabled{opacity:.35; cursor:not-allowed;}
.mmp-fp-hint{position:absolute; left:12px; bottom:12px; display:inline-flex; align-items:center; gap:5px; font-size:.7rem; color:var(--muted); background:rgba(255,255,255,.8); border-radius:7px; padding:5px 9px;}

.mmp-unit-info{display:flex; flex-direction:column; gap:14px;}
.mmp-unit-area{font-family:'Fraunces',serif; font-weight:500; font-size:1.9rem; color:var(--petrol); line-height:1; margin-top:-6px;}
.mmp-unit-specs{display:flex; flex-wrap:wrap; gap:16px; padding:14px 0; border-top:1px solid var(--line); border-bottom:1px solid var(--line);}
.mmp-unit-specs span{display:inline-flex; align-items:center; gap:7px; font-size:.9rem; font-weight:500;}
.mmp-unit-specs svg{color:var(--petrol);}
.mmp-unit-desc{font-size:.92rem; color:var(--muted);}

/* Galeria */
.mmp-gallery-head{display:flex; flex-direction:column; gap:8px; margin-bottom:18px;}
.mmp-gallery-head p{color:var(--muted); font-size:.95rem;}
.mmp-gallery{display:grid; grid-template-columns:repeat(2,1fr); gap:12px;}
.mmp-gal-tile{position:relative; border-radius:14px; overflow:hidden; aspect-ratio:4/3; border:1px solid var(--line);}
.mmp-gal-img,.mmp-gal-tile .mmp-img-ph{width:100%; height:100%; object-fit:cover; display:block; transition:transform .5s ease;}
.mmp-gal-tile:hover .mmp-gal-img{transform:scale(1.06);}
.mmp-gal-name{position:absolute; left:14px; bottom:12px; color:#fff; font-family:'Fraunces',serif; font-weight:500; font-size:1.05rem; text-shadow:0 1px 8px rgba(0,0,0,.5); z-index:2;}
.mmp-gal-tile::after{content:''; position:absolute; inset:0; background:linear-gradient(transparent 45%,rgba(11,42,48,.66)); z-index:1;}

/* Obra meter */
.mmp-obra{background:var(--canvas); border:1px solid var(--line); border-radius:16px; padding:22px; margin-top:8px;}
.mmp-obra-head{display:flex; align-items:flex-start; justify-content:space-between; gap:16px; padding-bottom:18px; border-bottom:1px solid var(--line); margin-bottom:18px;}
.mmp-obra-label{display:block; font-family:'Fraunces',serif; font-size:1.15rem; font-weight:500;}
.mmp-obra-sub{display:block; font-size:.74rem; color:var(--muted); margin-top:3px;}
.mmp-obra-total{text-align:right;}
.mmp-obra-num{font-family:'Fraunces',serif; font-size:2.6rem; font-weight:500; color:var(--petrol); line-height:1;}
.mmp-obra-num i{font-size:1.1rem; font-style:normal; color:var(--bronze); margin-left:2px;}
.mmp-obra-list{display:flex; flex-direction:column; gap:14px;}
.mmp-obra-row{display:grid; grid-template-columns:88px 1fr 38px; align-items:center; gap:12px;}
.mmp-obra-name{font-size:.78rem; color:var(--muted); font-weight:500;}
.mmp-obra-track{height:6px; background:var(--line); border-radius:99px; overflow:hidden;}
.mmp-obra-fill{display:block; height:100%; background:linear-gradient(90deg,var(--petrol),var(--green)); border-radius:99px; width:0; transition:width 1s cubic-bezier(.4,0,.2,1);}
.mmp-obra-pct{font-size:.78rem; font-weight:700; text-align:right; font-variant-numeric:tabular-nums;}

/* Diferenciais */
.mmp-dif-grid{display:grid; grid-template-columns:repeat(2,1fr); gap:14px; margin-bottom:50px;}
.mmp-dif-card{background:var(--canvas); border:1px solid var(--line); border-radius:14px; padding:22px; display:flex; flex-direction:column; gap:10px; transition:transform .25s, box-shadow .25s;}
.mmp-dif-card:hover{transform:translateY(-3px); box-shadow:0 14px 34px -22px rgba(16,58,65,.3);}
.mmp-dif-card svg{color:var(--bronze);}
.mmp-dif-card h3{font-family:'Fraunces',serif; font-weight:500; font-size:1.05rem;}
.mmp-dif-card p{font-size:.85rem; color:var(--muted);}

/* ESG */
.mmp-esg{background:var(--petrol); border-radius:20px; padding:34px; color:#fff; display:grid; grid-template-columns:1fr; gap:26px;}
.mmp-esg-head h3{color:#fff; margin:14px 0 10px;}
.mmp-esg-head p{color:rgba(255,255,255,.78); font-size:.92rem; max-width:46ch;}
.mmp-esg-grid{display:grid; grid-template-columns:repeat(2,1fr); gap:12px;}
.mmp-esg-item{display:flex; align-items:center; gap:11px; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1); border-radius:12px; padding:14px; font-size:.85rem; font-weight:500;}
.mmp-esg-item svg{color:var(--bronze); flex-shrink:0;}

/* Investir */
.mmp-invest{background:var(--petrol-2); color:#fff; padding:78px 0;}
.mmp-invest-in{display:grid; grid-template-columns:1fr; gap:34px; align-items:center;}
.mmp-invest-copy p{color:rgba(255,255,255,.8); margin-top:16px; max-width:48ch;}
.mmp-invest-copy .mmp-h2{margin-top:6px;}
.mmp-invest-list{list-style:none; margin:24px 0 28px; display:flex; flex-direction:column; gap:13px;}
.mmp-invest-list li{display:flex; align-items:flex-start; gap:11px; font-size:.95rem; color:rgba(255,255,255,.92);}
.mmp-invest-list svg{color:var(--bronze); flex-shrink:0; margin-top:2px;}
.mmp-invest-note{font-size:.74rem; color:rgba(255,255,255,.5); margin-top:14px;}
.mmp-invest-panel{background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.12); border-radius:18px; padding:26px;}
.mmp-invest-rows{display:flex; flex-direction:column; margin-top:8px;}
.mmp-invest-rows div{display:flex; align-items:center; justify-content:space-between; padding:15px 0; border-bottom:1px solid rgba(255,255,255,.1);}
.mmp-invest-rows div:last-child{border-bottom:none;}
.mmp-invest-rows span{font-size:.82rem; color:rgba(255,255,255,.6);}
.mmp-invest-rows strong{font-family:'Fraunces',serif; font-weight:500; font-size:1rem; color:#fff;}

/* Portfólio */
.mmp-port-grid{display:grid; grid-template-columns:1fr; gap:16px;}
.mmp-port-card{background:var(--card); border:1px solid var(--line); border-radius:16px; overflow:hidden; transition:transform .25s, box-shadow .25s;}
.mmp-port-card:hover{transform:translateY(-3px); box-shadow:0 18px 40px -26px rgba(16,58,65,.3);}
.mmp-port-img,.mmp-port-card .mmp-img-ph{width:100%; height:160px; object-fit:cover; display:block;}
.mmp-port-body{padding:22px;}
.mmp-port-top{display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:10px;}
.mmp-port-top h3{font-family:'Fraunces',serif; font-weight:500; font-size:1.3rem;}
.mmp-badge{font-size:.66rem; font-weight:700; text-transform:uppercase; letter-spacing:.07em; color:var(--bronze); background:rgba(182,138,78,.12); padding:5px 9px; border-radius:7px; white-space:nowrap;}
.mmp-badge.is-done{color:var(--green); background:rgba(46,125,116,.12);}
.mmp-port-body p{font-size:.88rem; color:var(--muted); margin-bottom:16px;}
.mmp-port-bar{height:5px; background:var(--line); border-radius:99px; overflow:hidden; margin-bottom:8px;}
.mmp-port-bar span{display:block; height:100%; background:var(--green); border-radius:99px;}
.mmp-port-pct{font-size:.74rem; color:var(--muted); font-weight:600;}

/* Sobre */
.mmp-about{display:grid; grid-template-columns:1fr; gap:38px;}
.mmp-about-copy p{color:var(--muted); margin-top:16px;}
.mmp-about-copy .mmp-h2{margin-top:14px;}
.mmp-about-seals{display:flex; flex-direction:column; gap:11px; margin-top:24px;}
.mmp-about-seals span{display:inline-flex; align-items:center; gap:9px; font-size:.88rem; font-weight:500;}
.mmp-about-seals svg{color:var(--bronze);}
.mmp-about-side{display:flex; flex-direction:column; gap:16px;}
.mmp-about-img,.mmp-about-side .mmp-img-ph{width:100%; height:220px; object-fit:cover; border-radius:14px; display:block;}
.mmp-quote{background:var(--canvas); border:1px solid var(--line); border-left:3px solid var(--bronze); border-radius:12px; padding:20px;}
.mmp-quote-icon{color:var(--line-2); margin-bottom:6px;}
.mmp-quote p{font-family:'Fraunces',serif; font-size:1.02rem; line-height:1.45; font-style:italic;}
.mmp-quote span{display:block; margin-top:10px; font-size:.78rem; color:var(--muted); font-weight:600;}

/* Contato */
.mmp-contact{display:grid; grid-template-columns:1fr; gap:34px;}
.mmp-contact-copy .mmp-h2{margin-top:14px;}
.mmp-contact-info{display:flex; flex-direction:column; gap:14px; margin-top:24px;}
.mmp-contact-info a,.mmp-contact-info span{display:inline-flex; align-items:flex-start; gap:11px; font-size:.9rem; color:var(--ink); text-decoration:none;}
.mmp-contact-info a:hover{color:var(--petrol);}
.mmp-contact-info svg{color:var(--bronze); flex-shrink:0; margin-top:2px;}
.mmp-form{background:var(--card); border:1px solid var(--line); border-radius:18px; padding:26px; box-shadow:0 24px 60px -34px rgba(16,58,65,.3); display:flex; flex-direction:column; gap:16px;}
.mmp-field{display:flex; flex-direction:column; gap:7px;}
.mmp-field-row{display:grid; grid-template-columns:1fr; gap:16px;}
.mmp-field label{font-size:.78rem; font-weight:600;}
.mmp-field input,.mmp-field textarea{font-family:'Manrope'; font-size:.92rem; color:var(--ink); background:var(--canvas); border:1px solid var(--line); border-radius:10px; padding:13px 14px; width:100%; transition:border-color .2s, box-shadow .2s; resize:vertical;}
.mmp-field input:focus,.mmp-field textarea:focus{outline:none; border-color:var(--petrol); box-shadow:0 0 0 3px rgba(16,58,65,.1);}
.mmp-field input::placeholder,.mmp-field textarea::placeholder{color:#a9aaa5;}
.mmp-intent{display:flex; flex-wrap:wrap; gap:8px;}
.mmp-intent-btn{font-family:'Manrope'; font-size:.82rem; font-weight:500; cursor:pointer; background:var(--canvas); border:1px solid var(--line); border-radius:99px; padding:9px 14px; color:var(--muted); transition:all .2s;}
.mmp-intent-btn:hover{border-color:var(--line-2);}
.mmp-intent-btn.is-on{background:var(--petrol); border-color:var(--petrol); color:#fff;}
.mmp-lgpd{display:flex; align-items:flex-start; gap:10px; cursor:pointer;}
.mmp-lgpd input{margin-top:3px; width:16px; height:16px; accent-color:var(--petrol); flex-shrink:0;}
.mmp-lgpd span{font-size:.78rem; color:var(--muted); line-height:1.4;}
.mmp-form-ok{text-align:center; padding:20px 0; display:flex; flex-direction:column; align-items:center; gap:12px;}
.mmp-form-ok-mark{width:60px; height:60px; border-radius:50%; background:rgba(46,125,116,.12); color:var(--green); display:flex; align-items:center; justify-content:center;}
.mmp-form-ok h3{font-family:'Fraunces',serif; font-weight:500; font-size:1.35rem;}
.mmp-form-ok p{color:var(--muted); font-size:.9rem; max-width:34ch;}

/* Footer */
.mmp-footer{background:var(--petrol-2); color:#fff; padding:54px 0 26px;}
.mmp-footer-grid{display:grid; grid-template-columns:1fr; gap:30px; padding-bottom:34px; border-bottom:1px solid rgba(255,255,255,.12);}
.mmp-footer-tag{color:rgba(255,255,255,.6); font-size:.84rem; margin-top:10px; max-width:30ch;}
.mmp-footer-col{display:flex; flex-direction:column; gap:11px;}
.mmp-footer-col span{font-size:.72rem; text-transform:uppercase; letter-spacing:.14em; color:rgba(255,255,255,.45); font-weight:600; margin-bottom:3px;}
.mmp-footer-col a,.mmp-footer-col button{color:rgba(255,255,255,.82); font-size:.88rem; text-decoration:none; background:none; border:none; text-align:left; cursor:pointer; font-family:'Manrope'; padding:0;}
.mmp-footer-col a:hover,.mmp-footer-col button:hover{color:var(--bronze);}
.mmp-footer-base{padding-top:22px; font-size:.78rem; color:rgba(255,255,255,.5);}

.mmp-wa-float{position:fixed; bottom:22px; right:22px; z-index:55; width:56px; height:56px; border-radius:50%; background:#25D366; color:#fff; display:flex; align-items:center; justify-content:center; box-shadow:0 10px 30px rgba(37,211,102,.4); transition:transform .25s;}
.mmp-wa-float:hover{transform:scale(1.08);}

@media(min-width:640px){
  .mmp-container{padding:0 32px;}
  .mmp-stats-grid{grid-template-columns:repeat(4,1fr);}
  .mmp-dif-grid{grid-template-columns:repeat(4,1fr);}
  .mmp-esg-grid{grid-template-columns:repeat(3,1fr);}
  .mmp-gallery{grid-template-columns:repeat(4,1fr);}
  .mmp-port-grid{grid-template-columns:repeat(3,1fr);}
  .mmp-field-row{grid-template-columns:1fr 1fr;}
}
@media(min-width:960px){
  .mmp-nav-desk{display:flex;}
  .mmp-nav-cta{display:inline-flex;}
  .mmp-burger{display:none;}
  .mmp-hero{padding:150px 0 90px;}
  .mmp-hero-in{grid-template-columns:1.1fr .9fr; gap:54px;}
  .mmp-hero-img{height:240px;}
  .mmp-focus-grid{grid-template-columns:1.25fr .75fr; align-items:start;}
  .mmp-esg{grid-template-columns:1fr 1fr; align-items:center; padding:44px;}
  .mmp-invest-in{grid-template-columns:1.2fr .8fr; gap:54px;}
  .mmp-about{grid-template-columns:.95fr 1.05fr;}
  .mmp-contact{grid-template-columns:.9fr 1.1fr;}
  .mmp-footer-grid{grid-template-columns:1.4fr 1fr 1fr 1fr;}
}
@media(prefers-reduced-motion:reduce){
  .mmp-reveal{transition:none; opacity:1; transform:none;}
  .mmp-obra-fill,.mmp-btn,.mmp-gal-img{transition:none;}
}
`;