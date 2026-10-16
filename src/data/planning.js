// src/data/planning.js

export const iso = (y, m, d) => new Date(Date.UTC(y, m - 1, d));

export const addDays = (date, number) => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + number);
  return result;
};

export const fmt = (date) =>
  `${String(date.getUTCDate()).padStart(2, "0")}/${String(
    date.getUTCMonth() + 1
  ).padStart(2, "0")}`;

export const fmtFull = (date) =>
  `${String(date.getUTCDate()).padStart(2, "0")}/${String(
    date.getUTCMonth() + 1
  ).padStart(2, "0")}/${date.getUTCFullYear()}`;

export const days = (a, b) => Math.round((b - a) / 86400000) + 1;

// Exports fantasma para não quebrar imports antigos
export const BASE = [];
export const OFFSETS = {};
export const DELAYS = new Set();
export const PLAN = [];

export const START = iso(2026, 10, 1);
export const END = iso(2026, 12, 31);

// Serviços em ordem alfabética,
// com os serviços de instalações agrupados no final.
export const SERVICES = [
  ["alvenaria", "Alvenaria Periférica"],
  ["chapisco", "Chapisco"],
  ["contrapiso", "Contrapiso"],
  ["esquadrias", "Esquadrias"],
  ["forro_gesso", "Forro de Gesso"],
  ["granitos", "Granitos"],
  ["impermeabilizacao", "Impermeabilização"],
  ["limpeza", "Limpeza"],
  ["loucas", "Louças"],
  ["metalurgia", "Metalurgia"],
  ["metais", "Metais"],
  ["pintura", "Pintura"],
  ["piso_polido", "Piso Polido"],
  ["portas_rodapes", "Portas e Rodapés"],
  ["premoldados", "Pré-moldados"],
  ["reboco", "Reboco"],
  ["revestimento_gesso", "Revestimento de Gesso"],
  ["revestimento_parede", "Revestimento de Parede"],
  ["revestimento_piso", "Revestimento de Piso"],

  // INSTALAÇÕES — agrupadas no final
  ["agua_mineral", "Instalações de Água Mineral"],
  ["aterramento", "Instalações de Aterramento"],
  ["cftv", "Instalações CFTV"],
  ["fiacao", "Instalações - Fiação"],
  ["frigorigenas", "Instalações Frigorígenas"],
  ["gas", "Instalações de Gás"],
  ["hidraulica", "Instalações Hidráulicas"],
  ["instalacoes_vedacoes_internas", "Instalações em Vedações Internas"],
  ["irrigacao", "Irrigação"],
  ["prumadas_fiacao", "Instalações - Prumadas e Fiação"],
  ["prumadas_incendio", "Prumadas e Ramais de Incêndio"],
  ["quadros_fechamentos", "Quadros e Fechamentos"],
  ["telefonia_tv", "Instalações de Telefonia e TV"],
  ["tomadas_disjuntores", "Instalação de Tomadas e Disjuntores"],
  ["tubulacao_eletrica_alvenaria", "Tubulação Elétrica e Alvenaria"],
  ["iluminacao", "Iluminação"],
].map(([id, nome]) => ({ id, nome }));

export const SERVICE = Object.fromEntries(
  SERVICES.map((service) => [service.id, service])
);

export const SERVICE_COLORS = {
  alvenaria: "#3B82F6",
  chapisco: "#22C55E",
  emboco: "#EAB308",
  reboco: "#F59E0B",
  revestimento_gesso: "#A1A1AA",
  forro_gesso: "#71717A",
  impermeabilizacao: "#06B6D4",
  piso_polido: "#06BC45",
  contrapiso: "#84CC16",
  revestimento_piso: "#F97316",
  revestimento_parede: "#EA580C",
  granitos: "#78716C",
  premoldados: "#A8A29E",
  pintura: "#C084FC",
  portas_rodapes: "#D97706",
  esquadrias: "#FB7185",
  loucas: "#E0F2FE",
  metais: "#94A3B8",
  limpeza: "#67E8F9",
  metalurgia: "#64748B",
  hidraulica: "#22D3EE",
  agua_mineral: "#0EA5E9",
  irrigacao: "#14B8A6",
  tubulacao_eletrica_alvenaria: "#818CF8",
  fiacao: "#6366F1",
  prumadas_fiacao: "#4F46E5",
  instalacoes_vedacoes_internas: "#7C3AED",
  telefonia_tv: "#9333EA",
  tomadas_disjuntores: "#A855F7",
  cftv: "#D946EF",
  aterramento: "#C026D3",
  iluminacao: "#FBBF24",
  quadros_fechamentos: "#FCD34D",
  prumadas_incendio: "#EF4444",
  gas: "#F87171",
  frigorigenas: "#FCA5A5",
};

export const STATUS = {
  andamento: {
    label: "Em andamento",
    color: "#22C55E",
  },
  concluido: {
    label: "Concluído",
    color: "#3B82F6",
  },
  previsto: {
    label: "Em breve",
    color: "#EAB308",
  },
  atrasado: {
    label: "Atrasado",
    color: "#EF4444",
  },
};

export const COLORS = {
  bg: "#07111A",
  panel: "#0B1722",
  card: "#101F2C",
  card2: "#132534",
  border: "#1C3040",
  text: "#EAF2F6",
  muted: "#7C93A3",
  dim: "#4E6577",
  green: "#5FD08A",
  greenDeep: "#1E5B3C",
  greenSoft: "rgba(95,208,138,.13)",
};