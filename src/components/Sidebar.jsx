import React from "react";
import { LayoutGrid } from "lucide-react";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        {/* Apenas a imagem da logo */}
        <img src="/assents/logo.png" alt="EVO Plan Logo" className="brand-logo-img" />
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