// src/components/FloorPlan.jsx
import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  Compass,
  Maximize2,
  Minus,
  Plus,
  Pencil,
  MousePointer2,
  PenLine,
  Square,
  Hexagon,
  Download,
  Trash2,
  X,
} from "lucide-react";

import { SERVICE, fmtFull } from "../data/planning";
import { loadHotspots, saveHotspots } from "../data/storage";

const COR_ALVENARIA = "#3A86D1";
const COR_AREA = "#5fd08a";

const ZOOM_MAX = 8;
const ZOOM_HARD_MIN = 0.5;

let nextId = 1;

function clampCenterGeneric(cx, cy, z, baseW, baseH) {
  const halfW = baseW / z / 2;
  const halfH = baseH / z / 2;
  return {
    cx: Math.min(baseW - halfW, Math.max(halfW, cx)),
    cy: Math.min(baseH - halfH, Math.max(halfH, cy)),
  };
}

function FloorPlan({
  pavimento,
  date,
  selectedEnvId,
  onSelect,
  onHotspotsChange,
  activitiesByEnv,
}) {
  const BASE_W = pavimento.baseW;
  const BASE_H = pavimento.baseH;

  const ZOOM_MIN = pavimento.zoomInicial ?? 1;

  const [zoom, setZoom] = useState(ZOOM_MIN);
  const [center, setCenter] = useState(() =>
    clampCenterGeneric(
      pavimento.centerInicial?.cx ?? BASE_W / 2,
      pavimento.centerInicial?.cy ?? BASE_H / 2,
      ZOOM_MIN,
      BASE_W,
      BASE_H
    )
  );

  const wrap = useRef(null);
  const stageRef = useRef(null);
  const svgRef = useRef(null);
  const [hover, setHover] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  const [panning, setPanning] = useState(false);
  const panStart = useRef(null);

  const [hotspots, setHotspots] = useState([]);

  const [editMode, setEditMode] = useState(false);
  const [drawMode, setDrawMode] = useState("select");
  const [currentPoints, setCurrentPoints] = useState([]);
  const [mousePos, setMousePos] = useState(null);
  const [rectStart, setRectStart] = useState(null);
  const [rectPreview, setRectPreview] = useState(null);

  const zoomRef = useRef(zoom);
  const centerRef = useRef(center);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);
  useEffect(() => {
    centerRef.current = center;
  }, [center]);

  // ---- carrega hotspots do Supabase ao trocar de pavimento ----
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const stored = await loadHotspots(pavimento.id);
      if (cancelled) return;
      const initial = stored || pavimento.hotspots || [];
      setHotspots(initial);

      const z = pavimento.zoomInicial ?? 1;
      const rawCx = pavimento.centerInicial?.cx ?? pavimento.baseW / 2;
      const rawCy = pavimento.centerInicial?.cy ?? pavimento.baseH / 2;
      const c = clampCenterGeneric(
        rawCx,
        rawCy,
        z,
        pavimento.baseW,
        pavimento.baseH
      );

      setZoom(z);
      setCenter(c);
      setHover(null);
      setEditMode(false);
      setDrawMode("select");
      setCurrentPoints([]);
      setRectStart(null);
      setRectPreview(null);
      setPanning(false);
      panStart.current = null;
      if (onHotspotsChange) onHotspotsChange();
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pavimento.id]);

  // ---- listener nativo de wheel ----
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    function onWheel(e) {
      e.preventDefault();
      e.stopPropagation();

      const oldZoom = zoomRef.current;
      const factor = Math.exp(-e.deltaY * 0.0015);
      let newZoom = oldZoom * factor;

      const zmin = Math.max(ZOOM_HARD_MIN, pavimento.zoomInicial ?? 1);
      newZoom = Math.min(ZOOM_MAX, Math.max(zmin, newZoom));

      if (Math.abs(newZoom - oldZoom) < 0.0001) return;

      const svg = svgRef.current;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const ctm = svg.getScreenCTM().inverse();
      const p = pt.matrixTransform(ctm);
      const mx = p.x;
      const my = p.y;

      const c = centerRef.current;
      const scale = oldZoom / newZoom;
      const newCx = mx + (c.cx - mx) * scale;
      const newCy = my + (c.cy - my) * scale;

      const clamped = clampCenterGeneric(
        newCx,
        newCy,
        newZoom,
        pavimento.baseW,
        pavimento.baseH
      );

      setZoom(newZoom);
      setCenter(clamped);
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [pavimento.baseW, pavimento.baseH, pavimento.zoomInicial]);

  // ---- persiste hotspots no Supabase (async) ----
  async function applyHotspots(updater) {
    const next = typeof updater === "function" ? updater(hotspots) : updater;
    setHotspots(next);
    await saveHotspots(pavimento.id, next);
    if (onHotspotsChange) onHotspotsChange();
  }

  const vbW = BASE_W / zoom;
  const vbH = BASE_H / zoom;
  const vbX = center.cx - vbW / 2;
  const vbY = center.cy - vbH / 2;
  const viewBox = `${vbX} ${vbY} ${vbW} ${vbH}`;

  const hoveredEnvironment = hotspots.find((h) => h.id === hover);
  const hoveredActivities =
    hover && activitiesByEnv ? activitiesByEnv(hover) : [];

  function handleMouseEnter(event, hotspot) {
    if (editMode || panning) return;
    setHover(hotspot.id);
    const environmentRect = event.currentTarget.getBoundingClientRect();
    const wrapRect = wrap.current.getBoundingClientRect();
    setHoverPosition({
      x: environmentRect.right - wrapRect.left + 12,
      y: environmentRect.top - wrapRect.top + environmentRect.height / 2,
    });
  }

  const svgPoint = useCallback((evt) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    const ctm = svg.getScreenCTM().inverse();
    const p = pt.matrixTransform(ctm);
    return [p.x, p.y];
  }, []);

  function clampCenter(cx, cy, z) {
    return clampCenterGeneric(cx, cy, z, BASE_W, BASE_H);
  }

  function zoomBy(factor) {
    const oldZoom = zoom;
    let newZoom = oldZoom * factor;
    newZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, newZoom));
    if (Math.abs(newZoom - oldZoom) < 0.0001) return;
    setZoom(newZoom);
    setCenter((c) => clampCenter(c.cx, c.cy, newZoom));
  }

  function resetZoom() {
    const z = pavimento.zoomInicial ?? 1;
    const rawCx = pavimento.centerInicial?.cx ?? BASE_W / 2;
    const rawCy = pavimento.centerInicial?.cy ?? BASE_H / 2;
    setZoom(z);
    setCenter(clampCenter(rawCx, rawCy, z));
  }

  function handlePanStart(evt) {
    const isMiddle = evt.button === 1;
    const isLeft = evt.button === 0;
    const canPanLeft = isLeft && !(editMode && drawMode !== "select");
    if (!isMiddle && !canPanLeft) return;

    evt.preventDefault();
    evt.stopPropagation();
    setPanning(true);
    setHover(null);
    panStart.current = {
      clientX: evt.clientX,
      clientY: evt.clientY,
      cx: center.cx,
      cy: center.cy,
    };
  }

  function handlePanMove(evt) {
    if (!panning || !panStart.current) return;
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const dxSvg =
      ((evt.clientX - panStart.current.clientX) / rect.width) * (BASE_W / zoom);
    const dySvg =
      ((evt.clientY - panStart.current.clientY) / rect.height) * (BASE_H / zoom);
    const { cx, cy } = clampCenter(
      panStart.current.cx - dxSvg,
      panStart.current.cy - dySvg,
      zoom
    );
    setCenter({ cx, cy });
  }

  function handlePanEnd() {
    if (!panning) return;
    setPanning(false);
    panStart.current = null;
  }

  function resetDrawing() {
    setCurrentPoints([]);
    setRectStart(null);
    setRectPreview(null);
  }

  function handleToggleEdit() {
    setEditMode((v) => !v);
    setDrawMode("select");
    resetDrawing();
    setHover(null);
  }

  function handleSetDrawMode(m) {
    setDrawMode(m);
    resetDrawing();
  }

  function handleSvgClick(evt) {
    if (panning) return;
    if (!editMode) return;
    if (drawMode === "linha" || drawMode === "poligono") {
      const p = svgPoint(evt);
      setCurrentPoints((pts) => [...pts, p]);
    }
  }

  function handleSvgDoubleClick() {
    if (!editMode) return;
    const minPts = drawMode === "poligono" ? 3 : 2;
    if (
      (drawMode === "linha" || drawMode === "poligono") &&
      currentPoints.length >= minPts
    ) {
      finalizarPontos();
    }
  }

  function handleSvgMouseDown(evt) {
    handlePanStart(evt);
    if (panning) return;
    if (!editMode || drawMode !== "retangulo") return;
    setRectStart(svgPoint(evt));
  }

  function handleSvgMouseMove(evt) {
    if (panning) {
      handlePanMove(evt);
      return;
    }
    if (!editMode) return;
    const p = svgPoint(evt);
    setMousePos(p);
    if (drawMode === "retangulo" && rectStart) {
      const x = Math.min(rectStart[0], p[0]);
      const y = Math.min(rectStart[1], p[1]);
      const w = Math.abs(p[0] - rectStart[0]);
      const h = Math.abs(p[1] - rectStart[1]);
      setRectPreview({ x, y, w, h });
    }
  }

  function handleSvgMouseUp() {
    if (panning) {
      handlePanEnd();
      return;
    }
    if (!editMode || drawMode !== "retangulo" || !rectStart || !rectPreview)
      return;
    if (rectPreview.w > 4 && rectPreview.h > 4) {
      const id = `${pavimento.id}-area-${nextId++}-${Date.now()}`;
      applyHotspots((hs) => [
        ...hs,
        {
          id,
          nome: `Área ${hs.length + 1}`,
          x: rectPreview.x,
          y: rectPreview.y,
          w: rectPreview.w,
          h: rectPreview.h,
        },
      ]);
    }
    setRectStart(null);
    setRectPreview(null);
  }

  function handleKeyDown(evt) {
    if (!editMode) return;
    if (evt.key === "Escape") resetDrawing();
    if (evt.key === "Enter") {
      const minPts = drawMode === "poligono" ? 3 : 2;
      if (
        (drawMode === "linha" || drawMode === "poligono") &&
        currentPoints.length >= minPts
      ) {
        finalizarPontos();
      }
    }
  }

  function finalizarPontos() {
    const prefix = drawMode === "linha" ? "alvenaria" : "area";
    const id = `${pavimento.id}-${prefix}-${nextId++}-${Date.now()}`;
    if (drawMode === "linha") {
      applyHotspots((hs) => [
        ...hs,
        {
          id,
          nome: `Alvenaria ${hs.filter((h) => h.tipo === "alvenaria").length + 1}`,
          tipo: "alvenaria",
          pontos: currentPoints,
        },
      ]);
    } else {
      applyHotspots((hs) => [
        ...hs,
        {
          id,
          nome: `Área ${hs.length + 1}`,
          tipo: "poligono",
          pontos: currentPoints,
        },
      ]);
    }
    resetDrawing();
  }

  function renomear(id, novoNome) {
    applyHotspots((hs) =>
      hs.map((h) => (h.id === id ? { ...h, nome: novoNome } : h))
    );
  }

  function remover(id) {
    applyHotspots((hs) => hs.filter((h) => h.id !== id));
  }

  function limparTodos() {
    if (
      !window.confirm(
        `Remover TODOS os ambientes do pavimento ${pavimento.nome}?`
      )
    )
      return;
    applyHotspots([]);
  }

  function exportarJson() {
    const data = JSON.stringify(hotspots, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hotspots-${pavimento.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function renderHotspot(hotspot) {
    const active = hover === hotspot.id || selectedEnvId === hotspot.id;
    const isAlvenaria = hotspot.tipo === "alvenaria";
    const isPoligono = hotspot.tipo === "poligono";
    const cor = isAlvenaria ? COR_ALVENARIA : COR_AREA;

    let shape;
    if (isAlvenaria) {
      shape = (
        <polyline
          points={hotspot.pontos.map((p) => p.join(",")).join(" ")}
          fill="none"
          stroke={cor}
          strokeOpacity={active ? 1 : 0.75}
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    } else if (isPoligono) {
      shape = (
        <polygon
          points={hotspot.pontos.map((p) => p.join(",")).join(" ")}
          fill={active ? `${cor}4d` : `${cor}15`}
          stroke={cor}
          strokeWidth="4"
        />
      );
    } else {
      shape = (
        <rect
          x={hotspot.x}
          y={hotspot.y}
          width={hotspot.w}
          height={hotspot.h}
          rx="6"
          fill={active ? "rgba(95,208,138,.30)" : "rgba(95,208,138,.08)"}
          stroke="#5fd08a"
          strokeWidth="4"
        />
      );
    }

    return (
      <g
        key={hotspot.id}
        onMouseEnter={(event) => handleMouseEnter(event, hotspot)}
        onMouseLeave={() => setHover(null)}
        onClick={() =>
          !editMode && !panning && onSelect && onSelect(hotspot.id)
        }
        style={{
          cursor: editMode ? "default" : panning ? "grabbing" : "pointer",
        }}
      >
        {shape}
      </g>
    );
  }

  function renderDrawingPreview() {
    if (drawMode === "retangulo" && rectPreview) {
      return (
        <rect
          x={rectPreview.x}
          y={rectPreview.y}
          width={rectPreview.w}
          height={rectPreview.h}
          fill={`${COR_AREA}25`}
          stroke={COR_AREA}
          strokeDasharray="14"
          strokeWidth="4"
        />
      );
    }
    if (
      (drawMode === "linha" || drawMode === "poligono") &&
      currentPoints.length > 0
    ) {
      const pts = mousePos ? [...currentPoints, mousePos] : currentPoints;
      const cor = drawMode === "linha" ? COR_ALVENARIA : COR_AREA;
      const Tag = drawMode === "poligono" ? "polygon" : "polyline";
      return (
        <>
          <Tag
            points={pts.map((p) => p.join(",")).join(" ")}
            fill={drawMode === "poligono" ? `${cor}25` : "none"}
            stroke={cor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {currentPoints.map((p, i) => (
            <circle
              key={i}
              cx={p[0]}
              cy={p[1]}
              r="12"
              fill={i === 0 ? "#fff" : cor}
            />
          ))}
        </>
      );
    }
    return null;
  }

  const svgCursor = panning
    ? "grabbing"
    : editMode && drawMode !== "select"
    ? "crosshair"
    : "grab";

  return (
    <div
      className="planwrap"
      ref={wrap}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseUp={handlePanEnd}
      onMouseLeave={handlePanEnd}
    >
      <div className="planstage" ref={stageRef}>
        <div className="planinner">
          <svg
            ref={svgRef}
            viewBox={viewBox}
            className="plan"
            style={{ cursor: svgCursor }}
            onClick={handleSvgClick}
            onDoubleClick={handleSvgDoubleClick}
            onMouseDown={handleSvgMouseDown}
            onMouseMove={handleSvgMouseMove}
            onMouseUp={handleSvgMouseUp}
            onAuxClick={(e) => e.preventDefault()}
          >
            <image
              href={pavimento.imagem}
              x="0"
              y="0"
              width={BASE_W}
              height={BASE_H}
            />

            {hotspots.map(renderHotspot)}
            {editMode && renderDrawingPreview()}
          </svg>
        </div>
      </div>

      <div className="compass">
        <Compass size={16} />
      </div>

      <div className="zoom">
        <button onClick={() => zoomBy(1.25)} title="Zoom in">
          <Plus size={14} />
        </button>
        <button onClick={() => zoomBy(1 / 1.25)} title="Zoom out">
          <Minus size={14} />
        </button>
        <button onClick={resetZoom} title="Resetar enquadramento">
          <Maximize2 size={13} />
        </button>
      </div>

      <button
        onClick={handleToggleEdit}
        title={
          editMode ? "Sair do editor de áreas" : "Editar áreas / alvenaria"
        }
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 5,
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "7px 12px",
          borderRadius: 8,
          border: `1px solid ${editMode ? "#3A86D1" : "#1c2f3d"}`,
          background: editMode ? "rgba(58,134,209,.18)" : "#101F2C",
          color: editMode ? "#bcdcff" : "#E6EEF3",
          fontSize: 12.5,
          cursor: "pointer",
        }}
      >
        {editMode ? <X size={14} /> : <Pencil size={14} />}
        {editMode ? "Sair do editor" : "Editar áreas"}
      </button>

      {editMode && (
        <div
          style={{
            position: "absolute",
            top: 56,
            right: 12,
            zIndex: 5,
            width: 250,
            background: "#0B1722",
            border: "1px solid #1c2f3d",
            borderRadius: 10,
            padding: 12,
            color: "#E6EEF3",
            fontSize: 12.5,
            maxHeight: "calc(100% - 76px)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div style={{ fontSize: 11, color: "#7c93a3" }}>
            Pavimento: <b style={{ color: "#5fd08a" }}>{pavimento.nome}</b>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <FerramentaBtn
              ativo={drawMode === "select"}
              onClick={() => handleSetDrawMode("select")}
              icon={<MousePointer2 size={14} />}
              label="Selecionar / mover"
            />
            <FerramentaBtn
              ativo={drawMode === "linha"}
              onClick={() => handleSetDrawMode("linha")}
              icon={<PenLine size={14} />}
              label="Alvenaria (linha)"
              cor={COR_ALVENARIA}
            />
            <FerramentaBtn
              ativo={drawMode === "retangulo"}
              onClick={() => handleSetDrawMode("retangulo")}
              icon={<Square size={14} />}
              label="Ambiente (retângulo)"
              cor={COR_AREA}
            />
            <FerramentaBtn
              ativo={drawMode === "poligono"}
              onClick={() => handleSetDrawMode("poligono")}
              icon={<Hexagon size={14} />}
              label="Ambiente (polígono)"
              cor={COR_AREA}
            />
          </div>

          <div
            style={{
              borderTop: "1px solid #1c2f3d",
              paddingTop: 8,
              color: "#7f95a3",
              lineHeight: 1.5,
            }}
          >
            {drawMode === "linha" &&
              "Clique ponto a ponto na parede. Duplo clique ou Enter finaliza."}
            {drawMode === "poligono" &&
              "Clique ponto a ponto contornando o ambiente (mín. 3). Duplo clique ou Enter fecha."}
            {drawMode === "retangulo" &&
              "Clique e arraste para desenhar o ambiente."}
            {drawMode === "select" &&
              "Arraste com o mouse para mover a planta."}
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {hotspots.length === 0 && (
              <div
                style={{
                  color: "#7f95a3",
                  fontSize: 11,
                  textAlign: "center",
                  padding: "10px 0",
                }}
              >
                Nenhum ambiente neste pavimento.
              </div>
            )}

            {hotspots.map((h) => (
              <div
                key={h.id}
                style={{
                  background: "#132534",
                  border: "1px solid #1c2f3d",
                  borderRadius: 8,
                  padding: 7,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="text"
                    value={h.nome}
                    onChange={(e) => renomear(h.id, e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: "#0B1722",
                      border: "1px solid #1c2f3d",
                      borderRadius: 6,
                      color: "#E6EEF3",
                      padding: "3px 6px",
                      fontSize: 12,
                    }}
                  />
                  <button
                    onClick={() => remover(h.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#7f95a3",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div
                  style={{
                    color: "#7f95a3",
                    fontSize: 10.5,
                    marginTop: 3,
                    wordBreak: "break-all",
                  }}
                >
                  id: <code>{h.id}</code>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={limparTodos}
              style={{
                flex: 1,
                padding: "6px 0",
                borderRadius: 7,
                border: "1px solid #1c2f3d",
                background: "#101F2C",
                color: "#E6EEF3",
                cursor: "pointer",
                fontSize: 11.5,
              }}
            >
              Limpar tudo
            </button>
            <button
              onClick={exportarJson}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                padding: "6px 0",
                borderRadius: 7,
                border: "1px solid #3A86D1",
                background: "rgba(58,134,209,.18)",
                color: "#bcdcff",
                cursor: "pointer",
                fontSize: 11.5,
              }}
            >
              <Download size={12} /> Exportar
            </button>
          </div>
        </div>
      )}

      {!editMode && !panning && hoveredEnvironment && (() => {
        const CARD_W = 460;
        const CARD_H = 240;
        const MARGIN = 12;

        const wrapW = wrap.current?.clientWidth || 0;
        const wrapH = wrap.current?.clientHeight || 0;

        let left = hoverPosition.x;
        if (wrapW && left + CARD_W + MARGIN > wrapW) {
          left = Math.max(MARGIN, wrapW - CARD_W - MARGIN);
        }

        let top = hoverPosition.y;
        if (wrapH) {
          const half = CARD_H / 2;
          top = Math.max(half + MARGIN, Math.min(wrapH - half - MARGIN, top));
        }

        return (
          <div
            className="hovercard"
            style={{
              left: `${left}px`,
              top: `${top}px`,
              maxHeight: wrapH ? `${wrapH - MARGIN * 2}px` : undefined,
              overflowY: "auto",
            }}
          >
            <div className="hover-title">
              <b>{hoveredEnvironment.nome}</b>
              <small>{pavimento.subtitulo}</small>
            </div>

            {hoveredActivities.length > 0 ? (
              <div className="hover-services">
                {hoveredActivities.map((item) => (
                  <div className="hover-service" key={item.id}>
                    <span className="hover-service-name">
                      {SERVICE[item.servicoId]?.nome || item.servicoId}
                    </span>
                    <span className="hover-dates">
                      {fmtFull(new Date(item.inicio))} →{" "}
                      {fmtFull(new Date(item.fim))}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="hover-empty">Nenhuma atividade cadastrada.</div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

function FerramentaBtn({ ativo, onClick, icon, label, cor }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 9px",
        borderRadius: 8,
        border: `1px solid ${ativo ? "#3A86D1" : "#1c2f3d"}`,
        background: ativo ? "rgba(58,134,209,.18)" : "#132534",
        color: ativo ? "#bcdcff" : "#E6EEF3",
        fontSize: 12,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      {cor && (
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: 3,
            background: cor,
            flexShrink: 0,
          }}
        />
      )}
      {icon}
      {label}
    </button>
  );
}

export default FloorPlan;