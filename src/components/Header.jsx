import React from "react";
import { CalendarDays, ChevronDown } from "lucide-react";

function Header() {
  return (
    <header className="topbar">
      <div>
        <button className="project">
          <span>Hortus Park</span>
          <ChevronDown size={15} />
        </button>

        <div className="subtitle">
          Acompanhamento de Obras
        </div>
      </div>

      <div className="userarea">
        <span className="updated">
          <CalendarDays size={14} />
          Atualizado em 15/09/2026 09:12
        </span>

        <span className="divider" />

        <span className="avatar">C</span>

        <div>
          <b>Caio</b>
          <small>Engenharia</small>
        </div>
      </div>
    </header>
  );
}

export default Header;