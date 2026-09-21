// src/hooks/useActivities.js
import { useState, useEffect, useCallback } from "react";
import { loadActivities, saveActivities } from "../data/storage";

export function useActivities(environmentIds) {
  const [byEnv, setByEnv] = useState({});

  useEffect(() => {
    const loadAll = async () => {
      const loaded = {};
      for (const envId of environmentIds) {
        const list = await loadActivities(envId);
        if (list.length) loaded[envId] = list;
      }
      setByEnv(loaded);
    };
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environmentIds.join("|")]);

  const getByEnv = useCallback((envId) => byEnv[envId] || [], [byEnv]);

  const add = useCallback(
    async (envId, { servicoId, inicio, fim }) => {
      const item = {
        id: crypto.randomUUID(),
        ambienteId: envId,
        servicoId,
        inicio: inicio.toISOString(),
        fim: fim.toISOString(),
      };
      const list = [...(byEnv[envId] || []), item];
      await saveActivities(envId, list);
      setByEnv((prev) => ({ ...prev, [envId]: list }));
    },
    [byEnv]
  );

  const remove = useCallback(
    async (envId, id) => {
      const list = (byEnv[envId] || []).filter((a) => a.id !== id);
      await saveActivities(envId, list);
      setByEnv((prev) => ({ ...prev, [envId]: list }));
    },
    [byEnv]
  );

  return { getByEnv, add, remove };
}