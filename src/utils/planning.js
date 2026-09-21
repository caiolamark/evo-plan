import { PLAN, START, END } from "../data/planning.js";

export function statusOf(item, date) {
  if (!item) return "previsto";

  if (date < item.inicio) {
    return "previsto";
  }

  if (date <= item.fim) {
    return "andamento";
  }

  return item.atrasado ? "atrasado" : "concluido";
}

export function serviceFor(envId, date) {
  const items = PLAN.filter(
    (item) => item.ambienteId === envId
  );

  const active = items.find(
    (item) =>
      date >= item.inicio &&
      date <= item.fim
  );

  if (active) {
    return {
      item: active,
      status: statusOf(active, date),
    };
  }

  const next = items
    .filter((item) => item.inicio > date)
    .sort((a, b) => a.inicio - b.inicio)[0];

  if (next) {
    return {
      item: next,
      status: "previsto",
    };
  }

  const last = [...items].sort(
    (a, b) => b.fim - a.fim
  )[0];

  return {
    item: last,
    status: statusOf(last, date),
  };
}

export function datePct(date) {
  return ((date - START) / (END - START)) * 100;
}