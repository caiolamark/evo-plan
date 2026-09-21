// src/components/Timeline.jsx
import React from "react";

import { STATUS, SERVICE, fmt } from "../data/planning";
import { datePct, statusOf } from "../utils/planning";

function Timeline({
  date,
  setDate,
  selectedEnvId,
  selectedEnv,
  activitiesByEnv,
  allActivities,
  pavimento,
}) {
  let items = [];
  let subtitle = "";

  if (selectedEnvId && activitiesByEnv) {
    items = activitiesByEnv(selectedEnvId);
    subtitle = selectedEnv
      ? `${selectedEnv.nome} · ${pavimento?.nome || ""}`
      : "Ambiente selecionado";
  } else {
    items = allActivities || [];
    subtitle = `${pavimento?.nome || "Pavimento"} · ${items.length} atividade${
      items.length === 1 ? "" : "s"
    }`;
  }

  items = items
    .slice()
    .sort((a, b) => new Date(a.inicio) - new Date(b.inicio));

  return (
    <div className="timeline">
      <div className="tl-title">
        <div>
          <b>Linha do tempo</b>
          <span>{subtitle}</span>
        </div>

        <div className="legend">
          {Object.entries(STATUS).map(([key, value]) => (
            <span key={key}>
              <i style={{ background: value.color }} />
              {value.label}
            </span>
          ))}
        </div>
      </div>

      <div className="track">
        <div className="line" />

        {items.length === 0 && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 0,
              right: 0,
              textAlign: "center",
              color: "#4e6577",
              fontSize: 11,
            }}
          >
            Nenhuma atividade para mostrar.
          </div>
        )}

        {items.map((item) => {
          const status = statusOf(item, date);
          return (
            <button
              key={item.id}
              title={`${SERVICE[item.servicoId]?.nome || item.servicoId}\n${fmt(
                new Date(item.inicio)
              )} → ${fmt(new Date(item.fim))}`}
              style={{
                left: `${datePct(new Date(item.inicio))}%`,
              }}
              onClick={() => setDate(new Date(item.inicio))}
            >
              <i style={{ background: STATUS[status].color }} />
              <span>{fmt(new Date(item.inicio))}</span>
            </button>
          );
        })}

        <div
          className="today"
          style={{ left: `${datePct(date)}%` }}
        >
          <span>{fmt(date)}</span>
        </div>
      </div>
    </div>
  );
}

export default Timeline;