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
].map(([id, nome]) => ({
  id,
  nome,
}));

export const SERVICE = Object.fromEntries(
  SERVICES.map((service) => [service.id, service])
);