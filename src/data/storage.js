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
  // 1) Limpa os antigos
  const { error: delError } = await supabase
    .from("hotspots")
    .delete()
    .eq("pavimento_id", pavId);

  if (delError) {
    console.error("Erro ao limpar hotspots:", delError);
    return;
  }

  if (!hotspots || hotspots.length === 0) return;

  // 2) Monta as linhas no formato EXATO da tabela
  const rows = hotspots.map((h) => {
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
      pontos:
        h.pontos && Array.isArray(h.pontos) ? h.pontos : null,
    };
  });

  console.log("VAI INSERIR:", rows);

  const { error: insError } = await supabase
    .from("hotspots")
    .insert(rows);

  if (insError) {
    console.error("Erro ao salvar hotspots:", insError);
    console.error("Detalhes:", insError.message, insError.details, insError.hint);
  } else {
    console.log("Hotspots salvos com sucesso!");
  }
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

export async function saveActivities(envId, activities) {
  const { error: delError } = await supabase
    .from("activities")
    .delete()
    .eq("ambiente_id", envId);

  if (delError) {
    console.error("Erro ao limpar atividades:", delError);
    return;
  }

  if (!activities || activities.length === 0) return;

  const rows = activities.map((a) => ({
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

  console.log("VAI INSERIR ACTIVITIES:", rows);

  const { error: insError } = await supabase
    .from("activities")
    .insert(rows);

  if (insError) {
    console.error("Erro ao salvar atividades:", insError);
    console.error("Detalhes:", insError.message, insError.details, insError.hint);
  } else {
    console.log("Atividades salvas com sucesso!");
  }
}

export function clearPavimento() {
  // mantido por compatibilidade
}