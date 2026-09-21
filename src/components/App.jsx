// src/components/App.jsx
import React, { useState, useMemo, useCallback } from "react";

import Header from "./Header";
import Sidebar from "./Sidebar";
import FloorPlan from "./FloorPlan";
import Detail from "./Detail";
import Timeline from "./Timeline";
import DateNav from "./DateNav";

import { START, addDays, fmtFull } from "../data/planning";
import { PAVIMENTOS, getPavimento } from "../data/pavimentos";
import { loadHotspots } from "../data/storage";
import { useActivities } from "../hooks/useActivities";

function App() {
  const [date, setDate] = useState(START);
  const [pavimentoId, setPavimentoId] = useState(PAVIMENTOS[0].id);
  const [selectedEnv, setSelectedEnv] = useState(null);
  const [hotspotsVersion, setHotspotsVersion] = useState(0);

  const pavimento = getPavimento(pavimentoId);

  const pavimentoHotspots = useMemo(() => {
    const stored = loadHotspots(pavimento.id);
    return stored || pavimento.hotspots || [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pavimento.id, hotspotsVersion]);

  const allEnvIds = useMemo(() => {
    return PAVIMENTOS.flatMap((p) => {
      const stored = loadHotspots(p.id);
      const list = stored || p.hotspots || [];
      return list.filter((h) => h.tipo !== "alvenaria").map((h) => h.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotspotsVersion]);

  const activities = useActivities(allEnvIds);

  const currentActivities = selectedEnv
    ? activities.getByEnv(selectedEnv.id)
    : [];

  // todas as atividades do pavimento atual
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