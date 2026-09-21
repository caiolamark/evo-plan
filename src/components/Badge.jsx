import React from "react";

function Badge({ status, STATUS }) {
  const s = STATUS[status];

  if (!s) return null;

  return (
    <span
      className="badge"
      style={{
        color: s.color,
        background: `${s.color}1C`,
      }}
    >
      <i style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

export default Badge;