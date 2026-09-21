import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function DateNav({ date, setDate, fmtFull, addDays }) {
  return (
    <div className="datenav">
      <button onClick={() => setDate(addDays(date, -1))}>
        <ChevronLeft size={15} />
      </button>

      <strong>{fmtFull(date)}</strong>

      <button onClick={() => setDate(addDays(date, 1))}>
        <ChevronRight size={15} />
      </button>
    </div>
  );
}

export default DateNav;