// src/components/GanttPavimento.jsx
import React, { useMemo, useRef, useEffect } from "react";
import { GanttChartSquare } from "lucide-react";
import { SERVICE } from "../data/planning";

const PX_DIA = 22; // largura de cada dia
const LABEL_W = 170; // coluna fixa com o nome do serviço
const ROW_H = 32;
const MONTH_H = 24;
const DAY_H = 22;
const HEADER_H = MONTH_H + DAY_H;
const MS_DIA = 86400000;

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

const COR_DESTAQUE = "#ff6b6b";

// evita deslocamento de fuso ("2026-10-01" virando 30/09 no Brasil)
function parseDia(v) {
  if (v instanceof Date) {
    return new Date(v.getUTCFullYear(), v.getUTCMonth(), v.getUTCDate());
  }
  const [y, m, d] = String(v).slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

const diffDias = (a, b) => Math.round((b - a) / MS_DIA);
const addDia = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

const fmt = (d) =>
  `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

export default function GanttPavimento({ pavimento, date, atividades, onSelectAmbiente }) {
  const dataSel = parseDia(date);
  const scrollRef = useRef(null);

  const dados = useMemo(() => {
    if (!atividades || atividades.length === 0) return null;

    const porServico = {};
    let minIni = null;
    let maxFim = null;

    atividades.forEach((a) => {
      const ini = parseDia(a.inicio);
      const fim = parseDia(a.fim);
      if (!minIni || ini < minIni) minIni = ini;
      if (!maxFim || fim > maxFim) maxFim = fim;

      const linha = (porServico[a.servicoId] ||= {
        servicoId: a.servicoId,
        primeiroInicio: ini,
        barras: [],
      });
      if (ini < linha.primeiroInicio) linha.primeiroInicio = ini;
      linha.barras.push({ id: a.id, ambienteId: a.ambienteId, ini, fim });
    });

    const linhas = Object.values(porServico).sort(
      (a, b) => a.primeiroInicio - b.primeiroInicio
    );

    // do 1º dia do mês inicial ao último dia do mês final
    const rangeStart = new Date(minIni.getFullYear(), minIni.getMonth(), 1);
    const rangeEnd = new Date(maxFim.getFullYear(), maxFim.getMonth() + 1, 0);
    const totalDias = diffDias(rangeStart, rangeEnd) + 1;

    const dias = Array.from({ length: totalDias }, (_, i) => {
      const d = addDia(rangeStart, i);
      return { d, i, dow: d.getDay(), num: d.getDate() };
    });

    const meses = [];
    let cursor = rangeStart;
    while (cursor <= rangeEnd) {
      const prox = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      meses.push({
        key: `${cursor.getFullYear()}-${cursor.getMonth()}`,
        label: `${MESES[cursor.getMonth()]} ${cursor.getFullYear()}`,
        left: diffDias(rangeStart, cursor) * PX_DIA,
        width: diffDias(cursor, prox) * PX_DIA,
      });
      cursor = prox;
    }

    return { linhas, rangeStart, rangeEnd, totalDias, dias, meses };
  }, [atividades]);

  const chartW = dados ? dados.totalDias * PX_DIA : 0;
  const idxSel =
    dados && dataSel >= dados.rangeStart && dataSel <= dados.rangeEnd
      ? diffDias(dados.rangeStart, dataSel)
      : null;

  // centraliza a data selecionada ao trocar de data / pavimento
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || idxSel === null) return;
    const alvo = idxSel * PX_DIA + PX_DIA / 2 - (el.clientWidth - LABEL_W) / 2;
    el.scrollTo({ left: Math.max(0, alvo), behavior: "smooth" });
  }, [idxSel, dados]);

  const cardStyle = {
    background: "linear-gradient(180deg, #112332 0%, #0f1e2b 100%)",
    border: "1px solid #1c2f3d",
    borderRadius: 14,
    padding: "14px 16px 16px",
    color: "#E6EEF3",
    boxShadow: "0 4px 18px rgba(0,0,0,.25)",
  };

  const titulo = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: "rgba(95,208,138,.14)",
            color: "#5fd08a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <GanttChartSquare size={16} />
        </div>
        <div>
          <div style={{ fontSize: 10.5, letterSpacing: 1.2, color: "#7f95a3", textTransform: "uppercase" }}>
            Cronograma do pavimento
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
            Gantt — {pavimento.nome}
          </div>
        </div>
      </div>

      {dados && (
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 11.5, color: "#7f95a3" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <i style={{ width: 10, height: 10, borderRadius: 3, background: "rgba(255,255,255,.07)", display: "inline-block" }} />
            Fim de semana
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <i style={{ width: 10, height: 10, borderRadius: 3, background: COR_DESTAQUE, display: "inline-block" }} />
            Data selecionada
          </span>
        </div>
      )}
    </div>
  );

  if (!dados) {
    return (
      <div style={cardStyle}>
        {titulo}
        <div style={{ color: "#7f95a3", fontSize: 13, padding: "14px 0", textAlign: "center" }}>
          Nenhuma atividade cadastrada neste pavimento.
        </div>
      </div>
    );
  }

  const { linhas, dias, meses } = dados;
  const corpoH = linhas.length * ROW_H;

  return (
    <div style={cardStyle}>
      {titulo}

      <div
        ref={scrollRef}
        style={{
          overflowX: "auto",
          border: "1px solid #1c2f3d",
          borderRadius: 10,
          background: "#0B1722",
        }}
      >
        <div style={{ display: "flex", width: LABEL_W + chartW }}>
          {/* ---------- coluna fixa: nomes ---------- */}
          <div
            style={{
              width: LABEL_W,
              flexShrink: 0,
              position: "sticky",
              left: 0,
              zIndex: 4,
              background: "#0d1a26",
              borderRight: "1px solid #24394a",
              boxShadow: "6px 0 10px -6px rgba(0,0,0,.6)",
            }}
          >
            <div
              style={{
                height: HEADER_H,
                display: "flex",
                alignItems: "flex-end",
                padding: "0 12px 6px",
                fontSize: 10.5,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: "#7f95a3",
                borderBottom: "1px solid #24394a",
                boxSizing: "border-box",
              }}
            >
              Serviço
            </div>

            {linhas.map((linha, i) => {
              const cor = SERVICE[linha.servicoId]?.cor || "#7f95a3";
              const nome = SERVICE[linha.servicoId]?.nome || linha.servicoId;
              return (
                <div
                  key={linha.servicoId}
                  style={{
                    height: ROW_H,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "0 12px",
                    fontSize: 12,
                    fontWeight: 600,
                    background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,.025)",
                    borderBottom: "1px solid rgba(28,47,61,.7)",
                    boxSizing: "border-box",
                  }}
                  title={nome}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: cor,
                      flexShrink: 0,
                      boxShadow: `0 0 8px ${cor}88`,
                    }}
                  />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {nome}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ---------- área do gráfico ---------- */}
          <div style={{ width: chartW, position: "relative" }}>
            {/* cabeçalho: meses + dias */}
            <div style={{ position: "relative", height: HEADER_H, borderBottom: "1px solid #24394a" }}>
              {meses.map((m) => (
                <div
                  key={m.key}
                  style={{
                    position: "absolute",
                    left: m.left,
                    width: m.width,
                    height: MONTH_H,
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: 10,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#fff",
                    background: "rgba(95,208,138,.07)",
                    borderLeft: "1px solid #24394a",
                    borderBottom: "1px solid #1c2f3d",
                    boxSizing: "border-box",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                >
                  <span style={{ position: "sticky", left: LABEL_W + 10 }}>{m.label}</span>
                </div>
              ))}

              {dias.map(({ i, dow, num }) => {
                const fimSemana = dow === 0 || dow === 6;
                const sel = i === idxSel;
                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: i * PX_DIA,
                      top: MONTH_H,
                      width: PX_DIA,
                      height: DAY_H,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      lineHeight: 1,
                      fontSize: 10,
                      fontWeight: sel ? 700 : 500,
                      color: sel ? "#07111A" : fimSemana ? "#5b7284" : "#9db2c1",
                      background: sel ? COR_DESTAQUE : fimSemana ? "rgba(255,255,255,.04)" : "transparent",
                      borderLeft: dow === 1 ? "1px solid #2a4254" : "1px solid rgba(28,47,61,.7)",
                      boxSizing: "border-box",
                    }}
                  >
                    <span>{num}</span>
                    <span style={{ fontSize: 7.5, marginTop: 2, opacity: 0.75 }}>
                      {DIAS_SEMANA[dow]}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* corpo */}
            <div style={{ position: "relative", height: corpoH }}>
              {/* grade: fins de semana, linhas de cada dia */}
              {dias.map(({ i, dow }) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: i * PX_DIA,
                    top: 0,
                    width: PX_DIA,
                    height: "100%",
                    background:
                      i === idxSel
                        ? "rgba(255,107,107,.10)"
                        : dow === 0 || dow === 6
                        ? "rgba(255,255,255,.035)"
                        : "transparent",
                    borderLeft:
                      dow === 1 ? "1px solid #2a4254" : "1px solid rgba(28,47,61,.55)",
                    boxSizing: "border-box",
                  }}
                />
              ))}

              {/* limite de mês */}
              {meses.map((m) => (
                <div
                  key={m.key}
                  style={{
                    position: "absolute",
                    left: m.left,
                    top: 0,
                    height: "100%",
                    borderLeft: "1px solid #3a5468",
                  }}
                />
              ))}

              {/* linhas (zebra + barras) */}
              {linhas.map((linha, i) => {
                const cor = SERVICE[linha.servicoId]?.cor || "#7f95a3";
                const nome = SERVICE[linha.servicoId]?.nome || linha.servicoId;
                return (
                  <div
                    key={linha.servicoId}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: i * ROW_H,
                      width: "100%",
                      height: ROW_H,
                      background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,.025)",
                      borderBottom: "1px solid rgba(28,47,61,.7)",
                      boxSizing: "border-box",
                    }}
                  >
                    {linha.barras.map((b) => {
                      const left = diffDias(dados.rangeStart, b.ini) * PX_DIA;
                      const nDias = diffDias(b.ini, b.fim) + 1;
                      const width = nDias * PX_DIA;
                      return (
                        <div
                          key={b.id}
                          onClick={() => onSelectAmbiente && onSelectAmbiente(b.ambienteId)}
                          title={`${nome}: ${fmt(b.ini)} → ${fmt(b.fim)} (${nDias} ${nDias === 1 ? "dia" : "dias"})`}
                          style={{
                            cursor: "pointer",
                            position: "absolute",
                            left: left + 1,
                            width: width - 2,
                            top: 6,
                            height: ROW_H - 12,
                            background: `linear-gradient(180deg, ${cor} 0%, ${cor}cc 100%)`,
                            borderRadius: 6,
                            boxShadow: `0 2px 8px ${cor}55, inset 0 1px 0 rgba(255,255,255,.25)`,
                            display: "flex",
                            alignItems: "center",
                            padding: "0 7px",
                            fontSize: 10.5,
                            fontWeight: 700,
                            color: "#07111A",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            boxSizing: "border-box",
                          }}
                        >
                          {width >= 120
                            ? `${fmt(b.ini)} → ${fmt(b.fim)} · ${nDias}d`
                            : width >= 70
                            ? `${nDias}d`
                            : ""}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* linha da data selecionada */}
              {idxSel !== null && (
                <div
                  style={{
                    position: "absolute",
                    left: idxSel * PX_DIA + PX_DIA / 2 - 1,
                    top: 0,
                    width: 2,
                    height: "100%",
                    background: COR_DESTAQUE,
                    boxShadow: `0 0 8px ${COR_DESTAQUE}99`,
                    pointerEvents: "none",
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}