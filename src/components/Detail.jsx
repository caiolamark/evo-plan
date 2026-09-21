// src/components/Detail.jsx
import React, { useState } from "react";
import { Building2, X, Plus, Trash2 } from "lucide-react";

import Badge from "./Badge";

import {
  SERVICE,
  SERVICES,
  SERVICE_COLORS,
  STATUS,
  fmt,
} from "../data/planning";

function toISODate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function toInputValue(dateLike) {
  const d = new Date(dateLike);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function statusOf(item, date) {
  const ini = new Date(item.inicio);
  const fim = new Date(item.fim);
  if (date > fim) return "concluido";
  if (date < ini) return "previsto";
  return "andamento";
}

function Detail({
  env,
  pavimento,
  date,
  activities,
  onAddActivity,
  onRemoveActivity,
  onClose,
}) {
  const todayStr = toInputValue(date);

  const [servicoId, setServicoId] = useState(SERVICES[0].id);
  const [inicio, setInicio] = useState(todayStr);
  const [fim, setFim] = useState(todayStr);
  const [erro, setErro] = useState("");

  if (!env) {
    return (
      <div className="empty">
        <Building2 size={18} />
        <b>Selecione um ambiente</b>
        <span>
          Clique em um ambiente da planta
          {pavimento ? ` (${pavimento.nome})` : ""} para abrir o planejamento.
        </span>
      </div>
    );
  }

  const items = activities || [];

  function handleAdd() {
    setErro("");
    if (!servicoId) {
      setErro("Escolha um serviço.");
      return;
    }
    if (!inicio || !fim) {
      setErro("Preencha as datas.");
      return;
    }
    const ini = toISODate(inicio);
    const f = toISODate(fim);
    if (f < ini) {
      setErro("A data final precisa ser depois da inicial.");
      return;
    }
    onAddActivity(env.id, { servicoId, inicio: ini, fim: f });
    setInicio(todayStr);
    setFim(todayStr);
  }

  return (
    <div className="details">
      <div className="detailhead">
        <div>
          <small>AMBIENTE SELECIONADO</small>
          <h2>{env.nome}</h2>
          <span>{pavimento ? pavimento.subtitulo : "Planta"}</span>
        </div>

        <button className="close" onClick={onClose}>
          <X size={15} />
        </button>
      </div>

      {/* ---------- FORM DE CADASTRO ---------- */}
      <div
        style={{
          margin: 13,
          padding: 12,
          border: "1px solid #1c2f3d",
          borderRadius: 9,
          background: "#0b1722",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <small style={{ color: "#5fd08a", fontSize: 10, fontWeight: 700 }}>
          ➕ ADICIONAR ATIVIDADE
        </small>

        <label style={{ fontSize: 11, color: "#cbd8df" }}>
          Serviço
          <select
            value={servicoId}
            onChange={(e) => setServicoId(e.target.value)}
            style={{
              width: "100%",
              marginTop: 4,
              padding: "6px 8px",
              background: "#101f2c",
              border: "1px solid #1c2f3d",
              borderRadius: 6,
              color: "#eaf2f6",
              fontSize: 12,
            }}
          >
            {SERVICES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <label style={{ flex: 1, fontSize: 11, color: "#cbd8df" }}>
            Início
            <input
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              style={{
                width: "100%",
                marginTop: 4,
                padding: "5px 8px",
                background: "#101f2c",
                border: "1px solid #1c2f3d",
                borderRadius: 6,
                color: "#eaf2f6",
                fontSize: 12,
              }}
            />
          </label>
          <label style={{ flex: 1, fontSize: 11, color: "#cbd8df" }}>
            Fim
            <input
              type="date"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
              style={{
                width: "100%",
                marginTop: 4,
                padding: "5px 8px",
                background: "#101f2c",
                border: "1px solid #1c2f3d",
                borderRadius: 6,
                color: "#eaf2f6",
                fontSize: 12,
              }}
            />
          </label>
        </div>

        {erro && (
          <div style={{ color: "#ef4444", fontSize: 11 }}>{erro}</div>
        )}

        <button
          onClick={handleAdd}
          style={{
            padding: "8px 0",
            borderRadius: 7,
            border: "1px solid #3A86D1",
            background: "rgba(58,134,209,.18)",
            color: "#bcdcff",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <Plus size={13} /> Adicionar
        </button>
      </div>

      {/* ---------- LISTA ---------- */}
      <div className="service-list">
        {items.length === 0 && (
          <div
            style={{
              color: "#7c93a3",
              fontSize: 11,
              padding: "14px 10px",
              textAlign: "center",
            }}
          >
            Nenhuma atividade cadastrada neste ambiente.
          </div>
        )}

        {items
          .slice()
          .sort((a, b) => new Date(a.inicio) - new Date(b.inicio))
          .map((item) => {
            const status = statusOf(item, date);
            return (
              <div
                key={item.id}
                className="service-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "9px 1fr 38px 38px auto auto",
                }}
              >
                <span
                  className="dot"
                  style={{ background: SERVICE_COLORS[item.servicoId] }}
                />
                <span className="service-name">
                  {SERVICE[item.servicoId].nome}
                </span>
                <span>{fmt(new Date(item.inicio))}</span>
                <span>{fmt(new Date(item.fim))}</span>
                <Badge status={status} STATUS={STATUS} />
                <button
                  onClick={() => onRemoveActivity(env.id, item.id)}
                  title="Remover"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#7f95a3",
                    cursor: "pointer",
                    padding: 2,
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default Detail;