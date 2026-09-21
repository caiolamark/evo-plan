// src/data/storage.js
const KEY_HOTSPOTS = (pavId) => `evoplan:hotspots:${pavId}`;
const KEY_ACTIVITIES = (envId) => `evoplan:activities:${envId}`;

// ---------- HOTSPOTS (ambientes desenhados) ----------
export function loadHotspots(pavId) {
  try {
    const raw = localStorage.getItem(KEY_HOTSPOTS(pavId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveHotspots(pavId, hotspots) {
  try {
    localStorage.setItem(KEY_HOTSPOTS(pavId), JSON.stringify(hotspots));
  } catch (e) {
    console.error("Erro ao salvar hotspots", e);
  }
}

// ---------- ATIVIDADES ----------
export function loadActivities(envId) {
  try {
    const raw = localStorage.getItem(KEY_ACTIVITIES(envId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveActivities(envId, activities) {
  try {
    localStorage.setItem(KEY_ACTIVITIES(envId), JSON.stringify(activities));
  } catch (e) {
    console.error("Erro ao salvar atividades", e);
  }
}

export function clearPavimento(pavId) {
  localStorage.removeItem(KEY_HOTSPOTS(pavId));
}