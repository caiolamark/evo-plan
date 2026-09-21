// src/App.jsx
import React, { useState, useMemo, useCallback, useEffect } from "react";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import FloorPlan from "./components/FloorPlan";
import Detail from "./components/Detail";
import Timeline from "./components/Timeline";
import DateNav from "./components/DateNav";

import { START, addDays, fmtFull } from "./data/planning";
import { PAVIMENTOS, getPavimento } from "./data/pavimentos";
import { loadHotspots } from "./data/storage";
import { useActivities } from "./hooks/useActivities";

function App() {
  const [date, setDate] = useState(START);
  const [pavimentoId, setPavimentoId] = useState(PAVIMENTOS[0].id);
  const [selectedEnv, setSelectedEnv] = useState(null);
  const [hotspotsVersion, setHotspotsVersion] = useState(0);
  const [pavimentoHotspots, setPavimentoHotspots] = useState([]);

  const pavimento = getPavimento(pavimentoId);

  // carrega hotspots do Supabase ao trocar de pavimento
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

  // lista de TODOS os ambientes pra o hook de atividades indexar
  const allEnvIds = useMemo(() => {
    return PAVIMENTOS.flatMap((p) => {
      const list = p.hotspots || [];
      return list.filter((h) => h.tipo !== "alvenaria").map((h) => h.id);
    });
  }, []);

  const activities = useActivities(allEnvIds);

  const currentActivities = selectedEnv
    ? activities.getByEnv(selectedEnv.id)
    : [];

  const allActivitiesDoPavimento = useMemo(() => {
    const ids = pavimentoHotspots
      .filter((h) => h.tipo !== "alvenaria")
      .map((h) => h.id);
    return ids.flatMap((id) => activities.getByEnv(id));
  }, [pavimentoHotspots, activities]);

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
              />
            </div>
          </div>

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
              onRemoveActivity={activities.remove}
              onClose={handleCloseEnv}
            />
          </div>

          <Timeline
            date={date}
            setDate={setDate}
            selectedEnvId={selectedEnv?.id || null}
            selectedEnv={selectedEnv}
            activitiesByEnv={activities.getByEnv}
            allActivities={allActivitiesDoPavimento}
            pavimento={pavimento}
          />
        </section>
      </main>
    </div>
  );
}

export default App;