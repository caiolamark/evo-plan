// src/data/storage.js
import { supabase } from "../lib/supabase";

// ---------- HOTSPOTS ----------
export async function loadHotspots(pavId) {
  const { data, error } = await supabase
    .from("hotspots")
    .select("*")
    .eq("pavimento_id", pavId);

  if (error) {
    console.error("Erro ao carregar hotspots:", error);
    return null;
  }

  return (data || []).map((h) => ({
    id: h.id,
    nome: h.nome,
    tipo: h.tipo,
    x: h.x != null ? Number(h.x) : undefined,
    y: h.y != null ? Number(h.y) : undefined,
    w: h.w != null ? Number(h.w) : undefined,
    h: h.h != null ? Number(h.h) : undefined,
    pontos: h.pontos,
  }));
}

export async function saveHotspots(pavId, hotspots) {
  const rows = (hotspots || []).map((h) => {
    const isArea = h.tipo !== "poligono" && h.tipo !== "alvenaria";
    return {
      id: String(h.id),
      pavimento_id: String(pavId),
      nome: String(h.nome || "Sem nome"),
      tipo: String(h.tipo || "area"),
      x: isArea && h.x != null ? Number(h.x) : null,
      y: isArea && h.y != null ? Number(h.y) : null,
      w: isArea && h.w != null ? Number(h.w) : null,
      h: isArea && h.h != null ? Number(h.h) : null,
      pontos: h.pontos && Array.isArray(h.pontos) ? h.pontos : null,
    };
  });

  const idsAtuais = rows.map((r) => r.id);

  const { data: existentes } = await supabase
    .from("hotspots")
    .select("id")
    .eq("pavimento_id", pavId);

  const idsRemover = (existentes || [])
    .map((e) => e.id)
    .filter((id) => !idsAtuais.includes(id));

  if (idsRemover.length > 0) {
    await supabase.from("hotspots").delete().in("id", idsRemover);
  }

  if (rows.length === 0) return;

  const { error } = await supabase
    .from("hotspots")
    .upsert(rows, { onConflict: "id" });

  if (error) console.error("Erro ao salvar hotspots:", error);
}

// ---------- ATIVIDADES ----------
export async function loadActivities(envId) {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("ambiente_id", envId);

  if (error) {
    console.error("Erro ao carregar atividades:", error);
    return [];
  }

  return (data || []).map((a) => ({
    id: a.id,
    ambienteId: a.ambiente_id,
    servicoId: a.servico_id,
    inicio: a.inicio,
    fim: a.fim,
  }));
}

// 🔒 fila de salvamento: garante que saves do mesmo envId rodem em sequência
const saveQueues = {};

export function saveActivities(envId, activities) {
  const prev = saveQueues[envId] || Promise.resolve();
  const next = prev
    .catch(() => {}) // ignora erros anteriores
    .then(() => doSaveActivities(envId, activities));
  saveQueues[envId] = next;
  return next;
}

async function doSaveActivities(envId, activities) {
  const rows = (activities || []).map((a) => ({
    id: String(a.id),
    ambiente_id: String(envId),
    servico_id: String(a.servicoId),
    inicio:
      typeof a.inicio === "string"
        ? a.inicio.slice(0, 10)
        : new Date(a.inicio).toISOString().slice(0, 10),
    fim:
      typeof a.fim === "string"
        ? a.fim.slice(0, 10)
        : new Date(a.fim).toISOString().slice(0, 10),
  }));

  const idsAtuais = rows.map((r) => r.id);

  const { data: existentes } = await supabase
    .from("activities")
    .select("id")
    .eq("ambiente_id", envId);

  const idsRemover = (existentes || [])
    .map((e) => e.id)
    .filter((id) => !idsAtuais.includes(id));

  if (idsRemover.length > 0) {
    await supabase.from("activities").delete().in("id", idsRemover);
  }

  if (rows.length === 0) return;

  const { error } = await supabase
    .from("activities")
    .upsert(rows, { onConflict: "id" });

  if (error) {
    console.error("Erro ao salvar atividades:", error);
  } else {
    console.log("Atividades salvas:", rows.length, "itens");
  }
}

export function clearPavimento() {}