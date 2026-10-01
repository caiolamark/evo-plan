// src/components/PanoramaMensal.jsx
import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { PAVIMENTOS } from "../data/pavimentos";
import { SERVICE } from "../data/planning";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

// evita deslocamento de fuso ("2026-10-01" virando 30/09 no Brasil)
function parseDia(v) {
  if (v instanceof Date) {
    return new Date(v.getFullYear(), v.getMonth(), v.getDate());
  }
  const [y, m, d] = String(v).slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

const fmt = (d) =>
  `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

export default function PanoramaMensal({ date, atividades }) {
  const [mes, setMes] = useState(() => {
    const d = parseDia(date);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // acompanha o navegador de datas do topo
  useEffect(() => {
    const d = parseDia(date);
    setMes(new Date(d.getFullYear(), d.getMonth(), 1));
  }, [date]);

  const dataSel = parseDia(date);
  const mesDaDataSel =
    mes.getFullYear() === dataSel.getFullYear() &&
    mes.getMonth() === dataSel.getMonth();

  const grupos = useMemo(() => {
    const inicioMes = mes;
    const fimMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0);
    const porPav = {};

    atividades.forEach((a) => {
      if (!a.pavimentoId) return;
      const ini = parseDia(a.inicio);
      const fim = parseDia(a.fim);
      if (ini > fimMes || fim < inicioMes) return; // não toca o mês

      const pav = (porPav[a.pavimentoId] ||= {});
      const s = (pav[a.servicoId] ||= {
        servicoId: a.servicoId,
        ini,
        fim,
        qtd: 0,
      });
      if (ini < s.ini) s.ini = ini;
      if (fim > s.fim) s.fim = fim;
      s.qtd += 1;
    });

    return PAVIMENTOS.filter((p) => porPav[p.id]).map((p) => ({
      pavimento: p,
      servicos: Object.values(porPav[p.id]).sort((a, b) => a.ini - b.ini),
    }));
  }, [atividades, mes]);

  const totalServicos = grupos.reduce((acc, g) => acc + g.servicos.length, 0);

  const navegar = (delta) =>
    setMes((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));

  const voltarParaDataSelecionada = () =>
    setMes(new Date(dataSel.getFullYear(), dataSel.getMonth(), 1));

  return (
    <div
      style={{
        background: "#101F2C",
        border: "1px solid #1c2f3d",
        borderRadius: 14,
        padding: 20,
        color: "#E6EEF3",
      }}
    >
      {/* Cabeçalho com o mês em destaque */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          paddingBottom: 16,
          marginBottom: 16,
          borderBottom: "1px solid #1c2f3d",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              letterSpacing: 1.2,
              color: "#7f95a3",
              textTransform: "uppercase",
            }}
          >
            <CalendarDays size={13} />
            Panorama do mês
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 4 }}>
            <span style={{ fontSize: 30, fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>
              {MESES[mes.getMonth()]}
            </span>
            <span style={{ fontSize: 20, fontWeight: 500, color: "#5fd08a" }}>
              {mes.getFullYear()}
            </span>
          </div>
          <div style={{ fontSize: 12.5, color: "#7f95a3", marginTop: 4 }}>
            {totalServicos === 0
              ? "Nenhum serviço previsto"
              : `${totalServicos} ${totalServicos === 1 ? "serviço" : "serviços"} em ${grupos.length} ${grupos.length === 1 ? "pavimento" : "pavimentos"}`}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!mesDaDataSel && (
            <button onClick={voltarParaDataSelecionada} style={btnTexto}>
              Voltar ao mês da data
            </button>
          )}
          <button onClick={() => navegar(-1)} style={btnNav} title="Mês anterior">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => navegar(1)} style={btnNav} title="Próximo mês">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      {grupos.length === 0 ? (
        <div
          style={{
            color: "#7f95a3",
            fontSize: 13.5,
            padding: "24px 0",
            textAlign: "center",
          }}
        >
          Nenhuma atividade cadastrada em {MESES[mes.getMonth()].toLowerCase()}.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 14,
          }}
        >
          {grupos.map(({ pavimento, servicos }) => (
            <div
              key={pavimento.id}
              style={{
                background: "#132534",
                border: "1px solid #1c2f3d",
                borderLeft: "4px solid #5fd08a",
                borderRadius: 10,
                padding: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
                  {pavimento.nome}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "#7f95a3",
                    background: "#0B1722",
                    borderRadius: 999,
                    padding: "2px 8px",
                  }}
                >
                  {servicos.length} {servicos.length === 1 ? "serviço" : "serviços"}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {servicos.map((s) => {
                  const cor = SERVICE[s.servicoId]?.cor || "#7f95a3";
                  const emAndamento = dataSel >= s.ini && dataSel <= s.fim;
                  return (
                    <div
                      key={s.servicoId}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        background: "#0B1722",
                        border: `1px solid ${emAndamento ? cor : "#1c2f3d"}`,
                        borderRadius: 8,
                        padding: "8px 10px",
                      }}
                    >
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: cor,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                          {SERVICE[s.servicoId]?.nome || s.servicoId}
                        </div>
                        <div style={{ fontSize: 11.5, color: "#7f95a3", marginTop: 2 }}>
                          {fmt(s.ini)} → {fmt(s.fim)}
                        </div>
                      </div>
                      {emAndamento && (
                        <span
                          style={{
                            fontSize: 10.5,
                            fontWeight: 600,
                            color: "#5fd08a",
                            background: "rgba(95,208,138,.12)",
                            borderRadius: 999,
                            padding: "2px 8px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Em andamento
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const btnNav = {
  background: "#0B1722",
  border: "1px solid #1c2f3d",
  borderRadius: 8,
  color: "#E6EEF3",
  padding: "8px 10px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
};

const btnTexto = {
  background: "transparent",
  border: "1px solid #1c2f3d",
  borderRadius: 8,
  color: "#bcdcff",
  padding: "8px 12px",
  fontSize: 12.5,
  cursor: "pointer",
};