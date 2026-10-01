// src/App.jsx
import React, { useState, useMemo, useCallback, useEffect } from "react";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import FloorPlan from "./components/FloorPlan";
import Detail from "./components/Detail";
import GanttPavimento from "./components/GanttPavimento";
import PanoramaMensal from "./components/PanoramaMensal";
import DateNav from "./components/DateNav";

import { addDays, fmtFull } from "./data/planning";
import { PAVIMENTOS, getPavimento } from "./data/pavimentos";
import { loadHotspots } from "./data/storage";
import { useActivities } from "./hooks/useActivities";

// "hoje" à meia-noite UTC, no mesmo padrão das datas das atividades
function hojeUTC() {
  const t = new Date();
  return new Date(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()));
}

function travar(d, limites) {
  if (!limites) return d;
  if (d < limites.min) return limites.min;
  if (d > limites.max) return limites.max;
  return d;
}

function App() {
  const [date, setDate] = useState(hojeUTC);
  const [pavimentoId, setPavimentoId] = useState(PAVIMENTOS[0].id);
  const [selectedEnv, setSelectedEnv] = useState(null);
  const [hotspotsVersion, setHotspotsVersion] = useState(0);
  const [pavimentoHotspots, setPavimentoHotspots] = useState([]);
  const [allEnvIds, setAllEnvIds] = useState([]);
  const [envPavMap, setEnvPavMap] = useState({}); // ambienteId -> pavimentoId

  const pavimento = getPavimento(pavimentoId);

  // carrega hotspots do pavimento atual (Supabase)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const stored = await loadHotspots(pavimento.id);
      if (cancelled) return;
      setPavimentoHotspots(stored || pavimento.hotspots || []);
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pavimento.id, hotspotsVersion]);

  // carrega TODOS os ambientes (de todos os pavimentos) + mapa ambiente -> pavimento
  useEffect(() => {
    let cancelled = false;
    const loadAll = async () => {
      const ids = [];
      const map = {};
      for (const p of PAVIMENTOS) {
        const stored = await loadHotspots(p.id);
        const list = stored || p.hotspots || [];
        list
          .filter((h) => h.tipo !== "alvenaria")
          .forEach((h) => {
            ids.push(h.id);
            map[h.id] = p.id;
          });
      }
      if (cancelled) return;
      setAllEnvIds(ids);
      setEnvPavMap(map);
    };
    loadAll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotspotsVersion]);

  const activities = useActivities(allEnvIds);

  const currentActivities = selectedEnv
    ? activities.getByEnv(selectedEnv.id)
    : [];

  // todas as atividades de todos os pavimentos, já com o pavimentoId
  const atividadesComPavimento = useMemo(
    () =>
      allEnvIds.flatMap((id) =>
        activities.getByEnv(id).map((a) => ({
          ...a,
          pavimentoId: envPavMap[id],
        }))
      ),
    [allEnvIds, envPavMap, activities]
  );

  // só as atividades do pavimento selecionado (usado no Gantt)
  const atividadesDoPavimento = useMemo(
    () => atividadesComPavimento.filter((a) => a.pavimentoId === pavimento.id),
    [atividadesComPavimento, pavimento.id]
  );

  // limites de data: da primeira atividade ao fim da última
  const limites = useMemo(() => {
    if (atividadesComPavimento.length === 0) return null;
    let min = null;
    let max = null;
    atividadesComPavimento.forEach((a) => {
      const ini = new Date(a.inicio);
      const fim = new Date(a.fim);
      if (!min || ini < min) min = ini;
      if (!max || fim > max) max = fim;
    });
    return { min, max };
  }, [atividadesComPavimento]);

  // mantém a data dentro dos limites (inclusive no carregamento inicial)
  useEffect(() => {
    if (!limites) return;
    setDate((d) => travar(d, limites));
  }, [limites]);

  const handleToday = useCallback(() => {
    setDate(travar(hojeUTC(), limites));
  }, [limites]);

  const handleSelect = useCallback(
    (envId) => {
      const env = pavimentoHotspots.find((h) => h.id === envId) || null;
      setSelectedEnv(env);
    },
    [pavimentoHotspots]
  );

  const handleCloseEnv = useCallback(() => setSelectedEnv(null), []);

  const handlePavimento = useCallback((id) => {
    setPavimentoId(id);
    setSelectedEnv(null);
  }, []);

  const handleHotspotsChange = useCallback(() => {
    setHotspotsVersion((v) => v + 1);
  }, []);

  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <Header />

        <section className="content">
          <div className="toolbar">
            <div>
              <small>PLANEJAMENTO</small>
              <h1>Planta Baixa — {pavimento.nome}</h1>
            </div>

            <div className="toolbar-right">
              <div className="pav-selector">
                <select
                  value={pavimentoId}
                  onChange={(e) => handlePavimento(e.target.value)}
                  title={pavimento.subtitulo}
                >
                  {PAVIMENTOS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </div>

              <DateNav
                date={date}
                setDate={setDate}
                fmtFull={fmtFull}
                addDays={addDays}
                minDate={limites?.min}
                maxDate={limites?.max}
                onToday={handleToday}
              />
            </div>
          </div>

          {/* Gantt do pavimento, acima da planta */}
          <GanttPavimento
            pavimento={pavimento}
            date={date}
            atividades={atividadesDoPavimento}
            onSelectAmbiente={handleSelect}
          />

          <div className="workspace">
            <FloorPlan
              pavimento={{ ...pavimento, hotspots: pavimentoHotspots }}
              date={date}
              selectedEnvId={selectedEnv?.id || null}
              onSelect={handleSelect}
              onHotspotsChange={handleHotspotsChange}
              activitiesByEnv={activities.getByEnv}
            />

            <Detail
              env={selectedEnv}
              pavimento={pavimento}
              date={date}
              activities={currentActivities}
              onAddActivity={activities.add}
              onUpdateActivity={activities.update}
              onRemoveActivity={activities.remove}
              onClose={handleCloseEnv}
            />
          </div>

          <PanoramaMensal date={date} atividades={atividadesComPavimento} />
        </section>
      </main>
    </div>
  );
}

export default App;