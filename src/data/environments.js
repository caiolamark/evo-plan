// src/data/environments.js
import { PAVIMENTOS } from "./pavimentos";

// ATENÇÃO: ENV fica vazio aqui de propósito.
// Os ambientes são criados no editor e lidos do localStorage no App.
export const ENV = PAVIMENTOS.flatMap((pav) =>
  pav.hotspots
    .filter((h) => h.tipo !== "alvenaria")
    .map((h) => ({
      id: h.id,
      nome: h.nome,
      pavimento: pav.id,
    }))
);