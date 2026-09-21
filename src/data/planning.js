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
  ["hidraulica", "Instalações Hidráulicas"],
  ["eletrica", "Instalações Elétricas"],
  ["emboco", "Emboço"],
  ["revestimento", "Revestimento Cerâmico"],
  ["forro", "Forro de Gesso"],
  ["esquadrias", "Esquadrias"],
  ["piso", "Piso"],
  ["pintura", "Pintura"],
].map(([id, nome]) => ({ id, nome }));

export const SERVICE = Object.fromEntries(
  SERVICES.map((service) => [service.id, service])
);

export const SERVICE_COLORS = {
  alvenaria: "#3B82F6",
  chapisco: "#22C55E",
  emboco: "#EAB308",
  revestimento: "#F97316",
  eletrica: "#818CF8",
  hidraulica: "#22D3EE",
  forro: "#A1A1AA",
  pintura: "#C084FC",
  esquadrias: "#FB7185",
  piso: "#2DD4BF",
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