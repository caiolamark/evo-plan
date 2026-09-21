// src/hooks/useActivities.js
import { useState, useEffect, useCallback } from "react";
import { loadActivities, saveActivities } from "../data/storage";

export function useActivities(environmentIds) {
  const [byEnv, setByEnv] = useState({});

  useEffect(() => {
    const loaded = {};
    environmentIds.forEach((envId) => {
      const list = loadActivities(envId);
      if (list.length) loaded[envId] = list;
    });
    setByEnv(loaded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environmentIds.join("|")]);

  const getByEnv = useCallback(
    (envId) => byEnv[envId] || [],
    [byEnv]
  );

  const add = useCallback((envId, { servicoId, inicio, fim }) => {
    const item = {
      id: `${envId}__${servicoId}_${Date.now()}`,
      ambienteId: envId,
      servicoId,
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
    };
    setByEnv((prev) => {
      const list = [...(prev[envId] || []), item];
      saveActivities(envId, list);
      return { ...prev, [envId]: list };
    });
  }, []);

  const remove = useCallback((envId, id) => {
    setByEnv((prev) => {
      const list = (prev[envId] || []).filter((a) => a.id !== id);
      saveActivities(envId, list);
      return { ...prev, [envId]: list };
    });
  }, []);

  return { getByEnv, add, remove };
}