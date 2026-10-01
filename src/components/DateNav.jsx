// src/components/DateNav.jsx
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function DateNav({
  date,
  setDate,
  fmtFull,
  addDays,
  minDate,
  maxDate,
  onToday,
}) {
  const anterior = addDays(date, -1);
  const proximo = addDays(date, 1);

  const semAnterior = !!minDate && anterior < minDate;
  const semProximo = !!maxDate && proximo > maxDate;

  const desabilitado = {
    opacity: 0.3,
    cursor: "not-allowed",
  };

  return (
    <div className="datenav">
      <button
        onClick={() => !semAnterior && setDate(anterior)}
        disabled={semAnterior}
        title={semAnterior ? "Não há atividades antes desta data" : "Dia anterior"}
        style={semAnterior ? desabilitado : undefined}
      >
        <ChevronLeft size={15} />
      </button>

      <strong>{fmtFull(date)}</strong>

      <button
        onClick={() => !semProximo && setDate(proximo)}
        disabled={semProximo}
        title={semProximo ? "Não há atividades depois desta data" : "Próximo dia"}
        style={semProximo ? desabilitado : undefined}
      >
        <ChevronRight size={15} />
      </button>

      {onToday && (
        <button
          onClick={onToday}
          title="Ir para hoje"
          style={{
            width: "auto",
            padding: "0 10px",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Hoje
        </button>
      )}
    </div>
  );
}

export default DateNav;