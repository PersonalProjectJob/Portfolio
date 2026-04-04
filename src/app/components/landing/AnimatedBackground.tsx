import { useEffect, useState } from "react";
import { motion } from "motion/react";

/* ================================================================== */
/*  AnimatedBackground — Fluid Gradient Mesh + AI/Tech Motion Shapes   */
/*  Shapes: neural nodes, circuit traces, data streams, signal pulses, */
/*  network graphs, code brackets, AI chips                            */
/* ================================================================== */

/* ------------------------------------------------------------------ */
/*  Shape type definitions                                              */
/* ------------------------------------------------------------------ */

type ShapeType =
  | "neural-node"
  | "circuit-trace"
  | "data-stream"
  | "signal-pulse"
  | "network-graph"
  | "code-bracket"
  | "ai-chip"
  | "orbit-ring";

interface FloatingShape {
  id: string;
  type: ShapeType;
  x: string;
  y: string;
  size: number;
  color: string;
  opacity: number;
  duration: number;
  floatDistance: number;
  rotate: number;
  desktopOnly?: boolean;
}

const SHAPES: FloatingShape[] = [
  /* ---- Neural network node — top-left area ---- */
  {
    id: "neural-1",
    type: "neural-node",
    x: "5%",
    y: "10%",
    size: 80,
    color: "var(--secondary)",
    opacity: 0.18,
    duration: 20,
    floatDistance: 30,
    rotate: 8,
  },
  /* ---- Circuit trace — top-right ---- */
  {
    id: "circuit-1",
    type: "circuit-trace",
    x: "85%",
    y: "6%",
    size: 70,
    color: "var(--primary)",
    opacity: 0.16,
    duration: 24,
    floatDistance: 22,
    rotate: 0,
  },
  /* ---- Data stream — mid-right ---- */
  {
    id: "data-1",
    type: "data-stream",
    x: "80%",
    y: "42%",
    size: 90,
    color: "var(--secondary)",
    opacity: 0.14,
    duration: 18,
    floatDistance: 20,
    rotate: 0,
    desktopOnly: true,
  },
  /* ---- Signal pulse — left-center ---- */
  {
    id: "signal-1",
    type: "signal-pulse",
    x: "10%",
    y: "55%",
    size: 72,
    color: "var(--primary)",
    opacity: 0.15,
    duration: 22,
    floatDistance: 18,
    rotate: -5,
    desktopOnly: true,
  },
  /* ---- Network graph — center-top (desktop) ---- */
  {
    id: "network-1",
    type: "network-graph",
    x: "48%",
    y: "18%",
    size: 100,
    color: "var(--secondary)",
    opacity: 0.14,
    duration: 26,
    floatDistance: 16,
    rotate: 5,
    desktopOnly: true,
  },
  /* ---- Code bracket — bottom-right ---- */
  {
    id: "code-1",
    type: "code-bracket",
    x: "88%",
    y: "70%",
    size: 56,
    color: "var(--primary)",
    opacity: 0.18,
    duration: 19,
    floatDistance: 28,
    rotate: -10,
    desktopOnly: true,
  },
  /* ---- AI chip — bottom-left ---- */
  {
    id: "chip-1",
    type: "ai-chip",
    x: "22%",
    y: "74%",
    size: 72,
    color: "var(--secondary)",
    opacity: 0.15,
    duration: 25,
    floatDistance: 20,
    rotate: 0,
  },
  /* ---- Orbit ring — mid-left (mobile visible) ---- */
  {
    id: "orbit-1",
    type: "orbit-ring",
    x: "30%",
    y: "5%",
    size: 60,
    color: "var(--primary)",
    opacity: 0.14,
    duration: 16,
    floatDistance: 24,
    rotate: 0,
  },
  /* ---- Neural node — bottom-center (desktop) ---- */
  {
    id: "neural-2",
    type: "neural-node",
    x: "58%",
    y: "78%",
    size: 64,
    color: "var(--primary)",
    opacity: 0.14,
    duration: 22,
    floatDistance: 26,
    rotate: -12,
    desktopOnly: true,
  },
  /* ---- Circuit trace — mid-center mobile ---- */
  {
    id: "circuit-2",
    type: "circuit-trace",
    x: "65%",
    y: "8%",
    size: 50,
    color: "var(--secondary)",
    opacity: 0.12,
    duration: 21,
    floatDistance: 32,
    rotate: 15,
  },
];

/* ================================================================== */
/*  SVG Shape Renderers — AI / Tech / IT themed                        */
/* ================================================================== */

/**
 * NeuralNode — central hub with dendrite branches ending in smaller nodes.
 * Internal CSS animation: nodes pulse, connections have dashed flow.
 */
function NeuralNodeShape({ size, color, uid }: { size: number; color: string; uid: string }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;

  // 5 branch endpoints evenly distributed
  const branches = Array.from({ length: 5 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      // secondary node slightly further
      x2: cx + r * 1.15 * Math.cos(angle + 0.15),
      y2: cy + r * 1.15 * Math.sin(angle + 0.15),
    };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <radialGradient id={`ng-${uid}`}>
          <stop offset="0%" stopColor={color} stopOpacity={0.5} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* Glow behind center */}
      <circle cx={cx} cy={cy} r={size * 0.2} fill={`url(#ng-${uid})`} />
      {/* Branches */}
      {branches.map((b, i) => (
        <g key={i}>
          <line
            x1={cx} y1={cy} x2={b.x} y2={b.y}
            stroke={color} strokeWidth={1} strokeDasharray="4 3"
            className="neural-line"
          />
          {/* secondary connection */}
          <line
            x1={b.x} y1={b.y} x2={b.x2} y2={b.y2}
            stroke={color} strokeWidth={0.6} strokeDasharray="2 3"
            className="neural-line"
          />
          {/* endpoint node */}
          <circle cx={b.x} cy={b.y} r={2.5} fill={color} className="neural-endpoint" />
          <circle cx={b.x2} cy={b.y2} r={1.5} fill={color} opacity={0.6} />
        </g>
      ))}
      {/* Center node */}
      <circle cx={cx} cy={cy} r={4} fill={color} className="neural-center" />
      <circle cx={cx} cy={cy} r={6.5} stroke={color} strokeWidth={0.8} fill="none" opacity={0.4} />
    </svg>
  );
}

/**
 * CircuitTrace — right-angled PCB-like path with dots at junctions.
 */
function CircuitTraceShape({ size, color, uid }: { size: number; color: string; uid: string }) {
  const s = size;
  // Draw a circuit path with right angles
  const path = `M ${s * 0.15},${s * 0.3} H ${s * 0.4} V ${s * 0.15} H ${s * 0.65} V ${s * 0.5} H ${s * 0.85} V ${s * 0.7} H ${s * 0.55} V ${s * 0.85} H ${s * 0.3}`;
  const pathLen = s * 3.5; // approximate

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Glow trace */}
      <path
        d={path}
        stroke={color}
        strokeWidth={2.5}
        fill="none"
        opacity={0.15}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Main animated trace */}
      <path
        d={path}
        stroke={color}
        strokeWidth={1.2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={pathLen}
        className="circuit-path"
        style={{ ["--path-len" as string]: pathLen }}
      />
      {/* Junction dots */}
      {[
        [0.15, 0.3], [0.4, 0.3], [0.4, 0.15], [0.65, 0.15],
        [0.65, 0.5], [0.85, 0.5], [0.85, 0.7], [0.55, 0.7],
        [0.55, 0.85], [0.3, 0.85],
      ].map(([x, y], i) => (
        <circle
          key={i}
          cx={s * (x as number)}
          cy={s * (y as number)}
          r={i === 0 || i === 9 ? 3 : 2}
          fill={color}
          opacity={i === 0 || i === 9 ? 1 : 0.7}
          className={`circuit-dot circuit-dot-${uid}`}
        />
      ))}
    </svg>
  );
}

/**
 * DataStream — vertical columns of small blocks flowing down, like a data pipeline.
 */
function DataStreamShape({ size, color }: { size: number; color: string }) {
  const cols = 3;
  const rows = 8;
  const cellW = size / (cols + 1);
  const cellH = size / (rows + 1);

  // Pseudo-random pattern (deterministic)
  const pattern = [
    [1, 0, 1], [0, 1, 0], [1, 1, 0], [0, 0, 1],
    [1, 0, 0], [0, 1, 1], [1, 0, 1], [0, 1, 0],
  ];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {pattern.map((row, ri) =>
        row.map((active, ci) => (
          <rect
            key={`${ri}-${ci}`}
            x={cellW * (ci + 0.7)}
            y={cellH * (ri + 0.5)}
            width={cellW * 0.5}
            height={cellH * 0.4}
            rx={1.5}
            fill={color}
            opacity={active ? 0.7 : 0.15}
            className="data-block"
            style={{ animationDelay: `${(ri * 0.15 + ci * 0.1)}s` }}
          />
        )),
      )}
      {/* Vertical guide lines */}
      {[1, 2, 3].map((c) => (
        <line
          key={c}
          x1={cellW * (c + 0.2)}
          y1={0}
          x2={cellW * (c + 0.2)}
          y2={size}
          stroke={color}
          strokeWidth={0.4}
          opacity={0.2}
          strokeDasharray="2 4"
        />
      ))}
    </svg>
  );
}

/**
 * SignalPulse — concentric arcs radiating from bottom-left, like radar/WiFi.
 */
function SignalPulseShape({ size, color }: { size: number; color: string }) {
  const ox = size * 0.2;
  const oy = size * 0.8;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Source dot */}
      <circle cx={ox} cy={oy} r={3.5} fill={color} className="signal-dot" />
      <circle cx={ox} cy={oy} r={6} stroke={color} strokeWidth={0.8} fill="none" opacity={0.4} />
      {/* Arcs */}
      {[0.25, 0.45, 0.65, 0.85].map((factor, i) => {
        const r = size * factor;
        return (
          <path
            key={i}
            d={`M ${ox + r * Math.cos(-Math.PI / 3)},${oy + r * Math.sin(-Math.PI / 3)} A ${r},${r} 0 0,0 ${ox + r * Math.cos(-Math.PI / 6 * 5)},${oy + r * Math.sin(-Math.PI / 6 * 5)}`}
            stroke={color}
            strokeWidth={1.2 - i * 0.15}
            fill="none"
            className={`signal-arc signal-arc-${i}`}
            style={{ animationDelay: `${i * 0.4}s` }}
          />
        );
      })}
    </svg>
  );
}

/**
 * NetworkGraph — constellation of nodes connected by lines.
 */
function NetworkGraphShape({ size, color }: { size: number; color: string }) {
  // 6 nodes in a constellation pattern
  const nodes = [
    { x: size * 0.5, y: size * 0.15, r: 3.5 },
    { x: size * 0.82, y: size * 0.3, r: 2.5 },
    { x: size * 0.75, y: size * 0.65, r: 3 },
    { x: size * 0.4, y: size * 0.8, r: 2.5 },
    { x: size * 0.15, y: size * 0.55, r: 3 },
    { x: size * 0.28, y: size * 0.25, r: 2 },
    // Central hub
    { x: size * 0.5, y: size * 0.48, r: 4.5 },
  ];

  // Connections: each outer node connects to center (index 6) and to neighbors
  const edges: [number, number][] = [
    [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
  ];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Connection lines */}
      {edges.map(([a, b], i) => (
        <line
          key={`e-${i}`}
          x1={nodes[a].x} y1={nodes[a].y}
          x2={nodes[b].x} y2={nodes[b].y}
          stroke={color}
          strokeWidth={b === 6 || a === 6 ? 1 : 0.6}
          opacity={b === 6 || a === 6 ? 0.6 : 0.3}
          strokeDasharray={b === 6 || a === 6 ? "none" : "3 3"}
          className="network-edge"
        />
      ))}
      {/* Data travel particles on hub connections */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle
          key={`p-${i}`}
          r={1.5}
          fill={color}
          className="network-particle"
          style={{ animationDelay: `${i * 0.8}s` }}
        >
          <animateMotion
            dur={`${3 + i * 0.5}s`}
            repeatCount="indefinite"
            path={`M${nodes[6].x},${nodes[6].y} L${nodes[i].x},${nodes[i].y}`}
          />
        </circle>
      ))}
      {/* Nodes */}
      {nodes.map((n, i) => (
        <g key={`n-${i}`}>
          {i === 6 && (
            <circle cx={n.x} cy={n.y} r={8} fill={color} opacity={0.1} className="network-hub-glow" />
          )}
          <circle
            cx={n.x} cy={n.y} r={n.r}
            fill={color}
            opacity={i === 6 ? 1 : 0.7}
            className={i === 6 ? "network-hub" : "network-node"}
          />
        </g>
      ))}
    </svg>
  );
}

/**
 * CodeBracket — stylized </> symbol representing code/development.
 */
function CodeBracketShape({ size, color }: { size: number; color: string }) {
  const s = size;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* < bracket */}
      <polyline
        points={`${s * 0.35},${s * 0.25} ${s * 0.12},${s * 0.5} ${s * 0.35},${s * 0.75}`}
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="code-bracket-left"
      />
      {/* / slash */}
      <line
        x1={s * 0.55} y1={s * 0.2}
        x2={s * 0.45} y2={s * 0.8}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.6}
      />
      {/* > bracket */}
      <polyline
        points={`${s * 0.65},${s * 0.25} ${s * 0.88},${s * 0.5} ${s * 0.65},${s * 0.75}`}
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="code-bracket-right"
      />
      {/* Cursor blink */}
      <line
        x1={s * 0.5} y1={s * 0.42}
        x2={s * 0.5} y2={s * 0.58}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        className="code-cursor"
      />
    </svg>
  );
}

/**
 * AIChip — processor die with internal trace grid and edge pins.
 */
function AIChipShape({ size, color }: { size: number; color: string }) {
  const s = size;
  const pad = s * 0.2;
  const inner = s - pad * 2;
  const pinCount = 4;
  const pinGap = inner / (pinCount + 1);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Outer chip border */}
      <rect
        x={pad} y={pad} width={inner} height={inner}
        rx={3}
        stroke={color} strokeWidth={1.5} fill="none"
      />
      {/* Inner die */}
      <rect
        x={pad + inner * 0.2} y={pad + inner * 0.2}
        width={inner * 0.6} height={inner * 0.6}
        rx={2}
        stroke={color} strokeWidth={0.8} fill={color} fillOpacity={0.08}
      />
      {/* Internal grid traces */}
      {[0.35, 0.5, 0.65].map((f) => (
        <g key={`g-${f}`}>
          <line
            x1={pad + inner * 0.2} y1={pad + inner * f}
            x2={pad + inner * 0.8} y2={pad + inner * f}
            stroke={color} strokeWidth={0.5} opacity={0.4}
            strokeDasharray="2 2"
          />
          <line
            x1={pad + inner * f} y1={pad + inner * 0.2}
            x2={pad + inner * f} y2={pad + inner * 0.8}
            stroke={color} strokeWidth={0.5} opacity={0.4}
            strokeDasharray="2 2"
          />
        </g>
      ))}
      {/* Edge pins — top, bottom, left, right */}
      {Array.from({ length: pinCount }, (_, i) => {
        const offset = pad + pinGap * (i + 1);
        return (
          <g key={`pin-${i}`}>
            {/* Top pins */}
            <line x1={offset} y1={0} x2={offset} y2={pad} stroke={color} strokeWidth={1} opacity={0.5} />
            <circle cx={offset} cy={pad * 0.3} r={1.5} fill={color} className="chip-pin" style={{ animationDelay: `${i * 0.3}s` }} />
            {/* Bottom pins */}
            <line x1={offset} y1={s - pad} x2={offset} y2={s} stroke={color} strokeWidth={1} opacity={0.5} />
            <circle cx={offset} cy={s - pad * 0.3} r={1.5} fill={color} className="chip-pin" style={{ animationDelay: `${i * 0.3 + 0.6}s` }} />
            {/* Left pins */}
            <line x1={0} y1={offset} x2={pad} y2={offset} stroke={color} strokeWidth={1} opacity={0.5} />
            <circle cx={pad * 0.3} cy={offset} r={1.5} fill={color} className="chip-pin" style={{ animationDelay: `${i * 0.3 + 1.2}s` }} />
            {/* Right pins */}
            <line x1={s - pad} y1={offset} x2={s} y2={offset} stroke={color} strokeWidth={1} opacity={0.5} />
            <circle cx={s - pad * 0.3} cy={offset} r={1.5} fill={color} className="chip-pin" style={{ animationDelay: `${i * 0.3 + 1.8}s` }} />
          </g>
        );
      })}
      {/* Center glow dot */}
      <circle cx={s / 2} cy={s / 2} r={3} fill={color} className="chip-core" />
    </svg>
  );
}

/**
 * OrbitRing — electron orbits around a nucleus, representing atomic/quantum computing.
 */
function OrbitRingShape({ size, color, uid }: { size: number; color: string; uid: string }) {
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Nucleus */}
      <circle cx={cx} cy={cy} r={3.5} fill={color} />
      <circle cx={cx} cy={cy} r={7} fill={color} opacity={0.1} />
      {/* Orbit 1 — horizontal ellipse */}
      <ellipse
        cx={cx} cy={cy} rx={size * 0.42} ry={size * 0.18}
        stroke={color} strokeWidth={0.8} fill="none" opacity={0.5}
        strokeDasharray="4 3"
        className={`orbit-path orbit-1-${uid}`}
      />
      {/* Electron 1 */}
      <circle r={2.5} fill={color} className={`orbit-electron orbit-e1-${uid}`}>
        <animateMotion
          dur="4s" repeatCount="indefinite"
          path={`M${cx - size * 0.42},${cy} a${size * 0.42},${size * 0.18} 0 1,1 ${size * 0.84},0 a${size * 0.42},${size * 0.18} 0 1,1 ${-size * 0.84},0`}
        />
      </circle>
      {/* Orbit 2 — tilted ellipse */}
      <ellipse
        cx={cx} cy={cy} rx={size * 0.38} ry={size * 0.16}
        stroke={color} strokeWidth={0.8} fill="none" opacity={0.4}
        strokeDasharray="3 4"
        transform={`rotate(60 ${cx} ${cy})`}
        className={`orbit-path orbit-2-${uid}`}
      />
      {/* Electron 2 */}
      <circle r={2} fill={color} opacity={0.8}>
        <animateMotion
          dur="5s" repeatCount="indefinite"
          path={`M${cx - size * 0.38},${cy} a${size * 0.38},${size * 0.16} 0 1,1 ${size * 0.76},0 a${size * 0.38},${size * 0.16} 0 1,1 ${-size * 0.76},0`}
          rotate="auto"
        />
      </circle>
      {/* Orbit 3 — opposite tilt */}
      <ellipse
        cx={cx} cy={cy} rx={size * 0.35} ry={size * 0.14}
        stroke={color} strokeWidth={0.6} fill="none" opacity={0.3}
        strokeDasharray="2 4"
        transform={`rotate(-50 ${cx} ${cy})`}
      />
      <circle r={1.8} fill={color} opacity={0.6}>
        <animateMotion
          dur="6s" repeatCount="indefinite"
          path={`M${cx - size * 0.35},${cy} a${size * 0.35},${size * 0.14} 0 1,1 ${size * 0.7},0 a${size * 0.35},${size * 0.14} 0 1,1 ${-size * 0.7},0`}
        />
      </circle>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Shape dispatcher                                                    */
/* ------------------------------------------------------------------ */

function TechShape({ type, size, color, uid }: { type: ShapeType; size: number; color: string; uid: string }) {
  switch (type) {
    case "neural-node":
      return <NeuralNodeShape size={size} color={color} uid={uid} />;
    case "circuit-trace":
      return <CircuitTraceShape size={size} color={color} uid={uid} />;
    case "data-stream":
      return <DataStreamShape size={size} color={color} />;
    case "signal-pulse":
      return <SignalPulseShape size={size} color={color} />;
    case "network-graph":
      return <NetworkGraphShape size={size} color={color} />;
    case "code-bracket":
      return <CodeBracketShape size={size} color={color} />;
    case "ai-chip":
      return <AIChipShape size={size} color={color} />;
    case "orbit-ring":
      return <OrbitRingShape size={size} color={color} uid={uid} />;
    default:
      return null;
  }
}

/* ================================================================== */
/*  Main AnimatedBackground component                                   */
/* ================================================================== */

export function AnimatedBackground() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const visibleShapes = isDesktop
    ? SHAPES
    : SHAPES.filter((s) => !s.desktopOnly);

  return (
    <div
      className="pointer-events-none"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      {/* ============================================================ */}
      {/*  CSS Keyframes — blobs + shape internals                      */}
      {/* ============================================================ */}
      <style>{`
        /* ---- Blob drift animations ---- */
        @keyframes blob-drift-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          20% { transform: translate(120px, -80px) scale(1.08); }
          40% { transform: translate(-60px, 100px) scale(0.92); }
          60% { transform: translate(80px, 60px) scale(1.05); }
          80% { transform: translate(-100px, -40px) scale(0.96); }
        }
        @keyframes blob-drift-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-100px, 70px) scale(0.94); }
          50% { transform: translate(90px, -100px) scale(1.08); }
          75% { transform: translate(-70px, -50px) scale(1.02); }
        }
        @keyframes blob-drift-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          30% { transform: translate(60px, -70px) scale(1.06); }
          60% { transform: translate(-80px, 50px) scale(0.95); }
          90% { transform: translate(40px, 30px) scale(1.03); }
        }
        @keyframes blob-drift-4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-50px, -80px) scale(1.04); }
          66% { transform: translate(70px, 40px) scale(0.97); }
        }
        @keyframes aurora-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes beam-slide {
          0% { transform: translateX(-100%) rotate(-35deg); }
          100% { transform: translateX(200%) rotate(-35deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.15); }
        }

        /* ---- Neural node internals ---- */
        .neural-center {
          animation: node-pulse 3s ease-in-out infinite;
        }
        .neural-endpoint {
          animation: node-pulse 3s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        .neural-line {
          animation: dash-flow 4s linear infinite;
        }
        @keyframes node-pulse {
          0%, 100% { opacity: 0.6; r: 2.5; }
          50% { opacity: 1; r: 3.5; }
        }
        @keyframes dash-flow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -20; }
        }

        /* ---- Circuit trace ---- */
        .circuit-path {
          animation: circuit-draw 5s linear infinite;
        }
        @keyframes circuit-draw {
          0% { stroke-dashoffset: var(--path-len, 250); opacity: 0.3; }
          50% { stroke-dashoffset: 0; opacity: 1; }
          100% { stroke-dashoffset: calc(var(--path-len, 250) * -1); opacity: 0.3; }
        }
        .chip-pin {
          animation: pin-blink 2s ease-in-out infinite;
        }
        @keyframes pin-blink {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        /* ---- Data stream ---- */
        .data-block {
          animation: data-pulse 2.5s ease-in-out infinite;
        }
        @keyframes data-pulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.8; }
        }

        /* ---- Signal pulse ---- */
        .signal-arc {
          animation: signal-ripple 3s ease-out infinite;
        }
        .signal-dot {
          animation: node-pulse 2s ease-in-out infinite;
        }
        @keyframes signal-ripple {
          0% { opacity: 0.8; stroke-width: 1.2; }
          100% { opacity: 0; stroke-width: 0.3; }
        }

        /* ---- Network graph ---- */
        .network-hub {
          animation: node-pulse 2.5s ease-in-out infinite;
        }
        .network-hub-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .network-edge {
          animation: edge-pulse 4s ease-in-out infinite;
        }
        @keyframes edge-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }

        /* ---- Code bracket ---- */
        .code-cursor {
          animation: cursor-blink 1s step-end infinite;
        }
        .code-bracket-left, .code-bracket-right {
          animation: bracket-breathe 4s ease-in-out infinite;
        }
        @keyframes cursor-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @keyframes bracket-breathe {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }

        /* ---- AI chip ---- */
        .chip-core {
          animation: node-pulse 2s ease-in-out infinite;
        }

        /* ---- Reduced motion ---- */
        @media (prefers-reduced-motion: reduce) {
          .animated-blob, .floating-shape, .aurora-band,
          .gradient-beam, .pulse-orb,
          .neural-center, .neural-endpoint, .neural-line,
          .circuit-path, .chip-pin, .data-block,
          .signal-arc, .signal-dot,
          .network-hub, .network-hub-glow, .network-edge,
          .code-cursor, .code-bracket-left, .code-bracket-right,
          .chip-core {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* ============================================================ */}
      {/*  Aurora gradient band                                         */}
      {/* ============================================================ */}
      <div
        className="aurora-band"
        style={{
          position: "absolute",
          top: 0,
          left: "-10%",
          right: "-10%",
          height: isDesktop ? "60vh" : "45vh",
          background: `linear-gradient(
            120deg,
            transparent 0%,
            color-mix(in srgb, var(--primary) 8%, transparent) 15%,
            color-mix(in srgb, var(--secondary) 12%, transparent) 35%,
            color-mix(in srgb, var(--primary) 6%, transparent) 55%,
            color-mix(in srgb, var(--secondary) 10%, transparent) 75%,
            transparent 100%
          )`,
          backgroundSize: "200% 100%",
          animation: "aurora-shift 15s ease-in-out infinite",
          filter: isDesktop ? "blur(60px)" : "blur(40px)",
          willChange: "background-position",
        }}
      />

      {/* ============================================================ */}
      {/*  Gradient mesh blobs                                          */}
      {/* ============================================================ */}
      <div
        className="animated-blob"
        style={{
          position: "absolute",
          top: isDesktop ? "-15%" : "-8%",
          left: isDesktop ? "-10%" : "-20%",
          width: isDesktop ? "700px" : "400px",
          height: isDesktop ? "700px" : "400px",
          borderRadius: "50%",
          background: `radial-gradient(circle, var(--primary) 0%, transparent 70%)`,
          opacity: 0.18,
          filter: isDesktop ? "blur(80px)" : "blur(60px)",
          animation: "blob-drift-1 24s ease-in-out infinite",
          willChange: "transform",
        }}
      />
      <div
        className="animated-blob"
        style={{
          position: "absolute",
          top: isDesktop ? "0%" : "-2%",
          right: isDesktop ? "-8%" : "-15%",
          width: isDesktop ? "600px" : "350px",
          height: isDesktop ? "600px" : "350px",
          borderRadius: "50%",
          background: `radial-gradient(circle, var(--secondary) 0%, transparent 70%)`,
          opacity: 0.2,
          filter: isDesktop ? "blur(90px)" : "blur(65px)",
          animation: "blob-drift-2 20s ease-in-out infinite",
          willChange: "transform",
        }}
      />
      <div
        className="animated-blob"
        style={{
          position: "absolute",
          top: "30%",
          left: "25%",
          width: isDesktop ? "550px" : "320px",
          height: isDesktop ? "550px" : "320px",
          borderRadius: "50%",
          background: `radial-gradient(circle, color-mix(in srgb, var(--secondary) 60%, var(--primary)) 0%, transparent 70%)`,
          opacity: 0.14,
          filter: isDesktop ? "blur(100px)" : "blur(70px)",
          animation: "blob-drift-3 22s ease-in-out infinite",
          willChange: "transform",
        }}
      />
      <div
        className="animated-blob"
        style={{
          position: "absolute",
          bottom: isDesktop ? "-5%" : "0%",
          right: "20%",
          width: isDesktop ? "500px" : "300px",
          height: isDesktop ? "500px" : "300px",
          borderRadius: "50%",
          background: `radial-gradient(circle, var(--primary) 0%, transparent 70%)`,
          opacity: 0.12,
          filter: isDesktop ? "blur(90px)" : "blur(65px)",
          animation: "blob-drift-4 26s ease-in-out infinite",
          willChange: "transform",
        }}
      />

      {/* ============================================================ */}
      {/*  Animated gradient beams                                      */}
      {/* ============================================================ */}
      {isDesktop && (
        <>
          <div
            className="gradient-beam"
            style={{
              position: "absolute",
              top: "10%",
              left: 0,
              width: "100%",
              height: "2px",
              background: `linear-gradient(90deg, transparent 0%, var(--secondary) 50%, transparent 100%)`,
              opacity: 0.15,
              animation: "beam-slide 8s linear infinite",
              willChange: "transform",
            }}
          />
          <div
            className="gradient-beam"
            style={{
              position: "absolute",
              top: "40%",
              left: 0,
              width: "100%",
              height: "1px",
              background: `linear-gradient(90deg, transparent 0%, var(--primary) 50%, transparent 100%)`,
              opacity: 0.1,
              animation: "beam-slide 12s linear infinite",
              animationDelay: "4s",
              willChange: "transform",
            }}
          />
        </>
      )}

      {/* ============================================================ */}
      {/*  Pulsing glow orbs                                            */}
      {/* ============================================================ */}
      <div
        className="pulse-orb"
        style={{
          position: "absolute",
          top: isDesktop ? "18%" : "15%",
          right: isDesktop ? "15%" : "8%",
          width: isDesktop ? "120px" : "80px",
          height: isDesktop ? "120px" : "80px",
          borderRadius: "50%",
          background: `radial-gradient(circle, var(--secondary) 0%, transparent 70%)`,
          opacity: 0.25,
          filter: "blur(30px)",
          animation: "pulse-glow 6s ease-in-out infinite",
          willChange: "transform, opacity",
        }}
      />
      <div
        className="pulse-orb"
        style={{
          position: "absolute",
          bottom: isDesktop ? "25%" : "20%",
          left: isDesktop ? "10%" : "5%",
          width: isDesktop ? "100px" : "60px",
          height: isDesktop ? "100px" : "60px",
          borderRadius: "50%",
          background: `radial-gradient(circle, var(--primary) 0%, transparent 70%)`,
          opacity: 0.2,
          filter: "blur(25px)",
          animation: "pulse-glow 8s ease-in-out infinite",
          animationDelay: "3s",
          willChange: "transform, opacity",
        }}
      />
      {isDesktop && (
        <div
          className="pulse-orb"
          style={{
            position: "absolute",
            top: "55%",
            left: "60%",
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            background: `radial-gradient(circle, color-mix(in srgb, var(--secondary) 70%, var(--primary)) 0%, transparent 70%)`,
            opacity: 0.18,
            filter: "blur(28px)",
            animation: "pulse-glow 7s ease-in-out infinite",
            animationDelay: "5s",
            willChange: "transform, opacity",
          }}
        />
      )}

      {/* ============================================================ */}
      {/*  Dot grid                                                     */}
      {/* ============================================================ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle, var(--primary) 0.6px, transparent 0.6px)`,
          backgroundSize: isDesktop ? "40px 40px" : "32px 32px",
          opacity: 0.04,
        }}
      />

      {/* ============================================================ */}
      {/*  Floating AI/Tech shapes (motion/react)                       */}
      {/* ============================================================ */}
      {visibleShapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="floating-shape"
          style={{
            position: "absolute",
            left: shape.x,
            top: shape.y,
            opacity: shape.opacity,
            willChange: "transform",
          }}
          animate={{
            y: [0, -shape.floatDistance, 0],
            rotate: [0, shape.rotate, 0],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <TechShape type={shape.type} size={shape.size} color={shape.color} uid={shape.id} />
        </motion.div>
      ))}
    </div>
  );
}
