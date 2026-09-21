import React from "react";
import { LayoutGrid } from "lucide-react";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="logo">E</span>

        <div>
          <strong>EVO PLAN</strong>
          <small>ENGENHARIA VISUAL DE OBRAS</small>
        </div>
      </div>

      <button className="nav active">
        <LayoutGrid size={16} />
        Planta Baixa
      </button>

      <div className="sidebottom">
        Mais controle, mais previsibilidade,
        <br />
        melhores resultados.

        <span className="mini">E</span>
      </div>
    </aside>
  );
}

export default Sidebar;