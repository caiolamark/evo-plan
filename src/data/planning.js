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

// exports fantasma pra não quebrar imports antigos
export const BASE = [];
export const OFFSETS = {};
export const DELAYS = new Set();
export const PLAN = [];

export const START = iso(2026, 10, 1);
export const END = iso(2026, 12, 31);

export const SERVICES = [
  ["alvenaria", "Alvenaria Periférica"],
  ["chapisco", "Chapisco"],
  ["emboco", "Emboço"],
  ["reboco", "Reboco"],
  ["revestimento_gesso", "Revestimento de Gesso"],
  ["forro_gesso", "Forro de Gesso"],
  ["impermeabilizacao", "Impermeabilização"],
  ["contrapiso", "Contrapiso"],
  ["revestimento_piso", "Revestimento de Piso"],
  ["revestimento_parede", "Revestimento de Parede"],
  ["granitos", "Granitos"],
  ["premoldados", "Pré-moldados"],
  ["pintura", "Pintura"],
  ["portas_rodapes", "Portas e Rodapés"],
  ["esquadrias", "Esquadrias"],
  ["loucas", "Louças"],
  ["metais", "Metais"],
  ["limpeza", "Limpeza"],
  ["metalurgia", "Metalurgia"],
  ["hidraulica", "Instalações Hidráulicas"],
  ["agua_mineral", "Instalações de Água Mineral"],
  ["irrigacao", "Irrigação"],
  ["tubulacao_eletrica_alvenaria", "Tubulação Elétrica e Alvenaria"],
  ["fiacao", "Fiação"],
  ["prumadas_fiacao", "Prumadas e Fiação"],
  ["instalacoes_vedacoes_internas", "Instalações em Vedações Internas"],
  ["telefonia_tv", "Instalações de Telefonia e TV"],
  ["tomadas_disjuntores", "Instalação de Tomadas e Disjuntores"],
  ["cftv", "CFTV"],
  ["aterramento", "Instalações de Aterramento"],
  ["iluminacao", "Iluminação"],
  ["quadros_fechamentos", "Quadros e Fechamentos"],
  ["prumadas_incendio", "Prumadas e Ramais de Incêndio"],
  ["gas", "Instalações de Gás"],
  ["frigorigenas", "Instalações Frigorígenas"],
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
  andamento: { label: "Em andamento", color: "#22C55E" },
  concluido: { label: "Concluído", color: "#3B82F6" },
  previsto: { label: "Em breve", color: "#EAB308" },
  atrasado: { label: "Atrasado", color: "#EF4444" },
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