// src/hooks/useActivities.js
import { useState, useEffect, useCallback, useRef } from "react";
import { loadActivities, saveActivities } from "../data/storage";

export function useActivities(environmentIds) {
  const [byEnv, setByEnv] = useState({});
  const byEnvRef = useRef(byEnv);

  useEffect(() => {
    byEnvRef.current = byEnv;
  }, [byEnv]);

  useEffect(() => {
    const loadAll = async () => {
      const loaded = {};
      for (const envId of environmentIds) {
        const list = await loadActivities(envId);
        if (list.length) loaded[envId] = list;
      }
      setByEnv(loaded);
      byEnvRef.current = loaded;
    };
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environmentIds.join("|")]);

  const getByEnv = useCallback((envId) => byEnv[envId] || [], [byEnv]);

  const add = useCallback(async (envId, { servicoId, inicio, fim }) => {
    const item = {
      id: crypto.randomUUID(),
      ambienteId: envId,
      servicoId,
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
    };
    const antes = byEnvRef.current[envId] || [];
    const list = [...antes, item];
    console.log(
      `[add] envId=${envId} | antes=${antes.length} | depois=${list.length} | servico=${servicoId}`
    );
    byEnvRef.current = { ...byEnvRef.current, [envId]: list };
    setByEnv((prev) => ({ ...prev, [envId]: list }));
    await saveActivities(envId, list);
  }, []);

  // edita as datas de uma atividade existente (mantém o mesmo id)
  const update = useCallback(async (envId, id, { inicio, fim }) => {
    const list = (byEnvRef.current[envId] || []).map((a) =>
      a.id === id
        ? { ...a, inicio: inicio.toISOString(), fim: fim.toISOString() }
        : a
    );
    byEnvRef.current = { ...byEnvRef.current, [envId]: list };
    setByEnv((prev) => ({ ...prev, [envId]: list }));
    await saveActivities(envId, list);
  }, []);

  const remove = useCallback(async (envId, id) => {
    const list = (byEnvRef.current[envId] || []).filter((a) => a.id !== id);
    byEnvRef.current = { ...byEnvRef.current, [envId]: list };
    setByEnv((prev) => ({ ...prev, [envId]: list }));
    await saveActivities(envId, list);
  }, []);

  return { getByEnv, add, update, remove };
}