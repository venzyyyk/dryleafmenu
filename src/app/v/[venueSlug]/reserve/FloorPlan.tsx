"use client";
import { motion } from "framer-motion";
import type { TableKind } from "@prisma/client";
import { TABLE_KIND_SHORT } from "@/lib/reserve";

export interface ReserveTable {
  id: string;
  number: number;
  seats: number;
  kind: TableKind;
}

interface Props {
  tables: ReserveTable[];
  selectedId: string | null;
  accentColor: string;
  venueSlug: string;
  onSelect: (table: ReserveTable) => void;
}

type Spot = { x: number; y: number; w: number; h: number };

const GOLD = "#C9A86A";
const SAGE = "#8DA888";
const FELT = "#3E5C46";
const FELT_LIGHT = "#4A6B52";
const WALL = "#3A3F32";
const DECOR = "#5A6050";

// ═══════════════ DRY LEAF (760×460, вход снизу) ═══════════════
const DRYLEAF_SPOTS: Record<string, Spot> = {
  "BILLIARD_SMALL-1": { x: 70, y: 52, w: 50, h: 74 },
  "BILLIARD_SMALL-2": { x: 148, y: 52, w: 50, h: 74 },
  "BILLIARD_LARGE-1": { x: 52, y: 178, w: 124, h: 64 },
  "BILLIARD_LARGE-2": { x: 58, y: 288, w: 56, h: 104 },
  "BILLIARD_LARGE-3": { x: 140, y: 288, w: 56, h: 104 },
  "BILLIARD_LARGE-4": { x: 584, y: 52, w: 124, h: 64 },
  "BILLIARD_LARGE-5": { x: 584, y: 160, w: 124, h: 64 },
  "BILLIARD_LARGE-6": { x: 566, y: 288, w: 56, h: 104 },
  "BILLIARD_LARGE-7": { x: 648, y: 288, w: 56, h: 104 },
  "DINING-1": { x: 350, y: 172, w: 58, h: 78 },
  "DINING-2": { x: 350, y: 284, w: 58, h: 78 },
  "DINING-3": { x: 212, y: 24, w: 36, h: 36 },
  "DINING-4": { x: 514, y: 24, w: 36, h: 36 },
  "DINING-5": { x: 22, y: 120, w: 36, h: 36 },
  "DINING-6": { x: 22, y: 404, w: 36, h: 36 },
  "DINING-7": { x: 702, y: 120, w: 36, h: 36 },
  "DINING-8": { x: 702, y: 404, w: 36, h: 36 },
  "DINING-9": { x: 212, y: 404, w: 36, h: 36 },
  "DINING-10": { x: 514, y: 404, w: 36, h: 36 },
};

function DryleafFixtures() {
  return (
    <>
      {/* Окна (верхняя стена) */}
      <line x1="120" y1="8" x2="185" y2="8" stroke={DECOR} strokeWidth="7" strokeLinecap="round" />
      <line x1="575" y1="8" x2="640" y2="8" stroke={DECOR} strokeWidth="7" strokeLinecap="round" />

      {/* Бар */}
      <g filter="url(#softShadow)">
        <rect x="252" y="20" width="256" height="64" rx="10" fill="#232619" stroke={SAGE} strokeWidth="1.5" />
        <rect x="252" y="72" width="256" height="12" rx="6" fill={SAGE} opacity="0.25" />
        <text x="380" y="55" textAnchor="middle" fill={SAGE} fontSize="16" letterSpacing="6" fontWeight="500">
          БАР
        </text>
      </g>
      {[288, 334, 380, 426, 472].map((cx) => (
        <circle key={cx} cx={cx} cy={100} r="6" fill="none" stroke={DECOR} strokeWidth="1.5" />
      ))}

      {/* Вход снизу */}
      <path d="M 342 450 A 38 38 0 0 1 380 412" fill="none" stroke={DECOR} strokeWidth="1.5" strokeDasharray="3 4" />
      <rect x="342" y="446" width="76" height="9" rx="3" fill="#0E0F0C" stroke={DECOR} strokeWidth="1" />
      <text x="380" y="436" textAnchor="middle" fill="#9A9B90" fontSize="10" letterSpacing="3">
        ВХІД
      </text>
    </>
  );
}

// ═══════════════ CITADEL (560×640, вход сверху, бар снизу) ═══════════════
const CITADEL_SPOTS: Record<string, Spot> = {
  "BILLIARD_LARGE-8": { x: 66, y: 58, w: 66, h: 120 },
  "BILLIARD_LARGE-1": { x: 428, y: 58, w: 66, h: 120 },
  "BILLIARD_LARGE-7": { x: 58, y: 238, w: 130, h: 68 },
  "BILLIARD_LARGE-2": { x: 372, y: 238, w: 130, h: 68 },
  "BILLIARD_LARGE-6": { x: 58, y: 348, w: 130, h: 68 },
  "BILLIARD_LARGE-3": { x: 372, y: 348, w: 130, h: 68 },
  "BILLIARD_LARGE-5": { x: 66, y: 458, w: 66, h: 120 },
  "BILLIARD_LARGE-4": { x: 428, y: 458, w: 66, h: 120 },
};

function CitadelFixtures() {
  return (
    <>
      {/* Вход сверху */}
      <rect x="242" y="6" width="76" height="9" rx="3" fill="#0E0F0C" stroke={DECOR} strokeWidth="1" />
      <path d="M 242 12 A 38 38 0 0 0 280 50" fill="none" stroke={DECOR} strokeWidth="1.5" strokeDasharray="3 4" />
      <text x="280" y="34" textAnchor="middle" fill="#9A9B90" fontSize="10" letterSpacing="3">
        ВХІД
      </text>

      {/* Бар внизу по центру */}
      <g filter="url(#softShadow)">
        <rect x="206" y="478" width="148" height="104" rx="10" fill="#232619" stroke={SAGE} strokeWidth="1.5" />
        <rect x="206" y="478" width="148" height="12" rx="6" fill={SAGE} opacity="0.25" />
        <text x="280" y="536" textAnchor="middle" fill={SAGE} fontSize="15" letterSpacing="5" fontWeight="500">
          БАР
        </text>
      </g>
      {[228, 262, 296, 330].map((cx) => (
        <circle key={cx} cx={cx} cy={464} r="6" fill="none" stroke={DECOR} strokeWidth="1.5" />
      ))}

      {/* Диванчики вдоль стен (декор) */}
      {[100, 180, 300, 380, 500].map((y) => (
        <rect key={`l${y}`} x="20" y={y} width="13" height="30" rx="5" fill="none" stroke={DECOR} strokeWidth="1.3" />
      ))}
      {[100, 180, 300, 380, 500].map((y) => (
        <rect key={`r${y}`} x="527" y={y} width="13" height="30" rx="5" fill="none" stroke={DECOR} strokeWidth="1.3" />
      ))}
    </>
  );
}

// ═══════════════ Конфиг залов ═══════════════
const PLANS: Record<string, { vbW: number; vbH: number; spots: Record<string, Spot>; Fixtures: () => JSX.Element }> = {
  "dry-leaf": { vbW: 760, vbH: 460, spots: DRYLEAF_SPOTS, Fixtures: DryleafFixtures },
  "citadel": { vbW: 560, vbH: 640, spots: CITADEL_SPOTS, Fixtures: CitadelFixtures },
};

export function FloorPlan({ tables, selectedId, accentColor, venueSlug, onSelect }: Props) {
  const plan = PLANS[venueSlug];

  if (!plan) {
    return (
      <TableChips tables={tables} selectedId={selectedId} accentColor={accentColor} venueSlug={venueSlug} onSelect={onSelect} />
    );
  }

  const placed: { table: ReserveTable; spot: Spot }[] = [];
  tables.forEach((t) => {
    const spot = plan.spots[`${t.kind}-${t.number}`];
    if (spot) placed.push({ table: t, spot });
  });

  if (placed.length === 0) {
    return (
      <TableChips tables={tables} selectedId={selectedId} accentColor={accentColor} venueSlug={venueSlug} onSelect={onSelect} />
    );
  }

  const { vbW, vbH, Fixtures } = plan;
  const kindsPresent = new Set(placed.map((p) => p.table.kind));

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-surface border border-line p-3 sm:p-4">
        <svg
          viewBox={`0 0 ${vbW} ${vbH}`}
          className="mx-auto h-auto w-full select-none"
          style={vbH > vbW ? { maxWidth: 440 } : undefined}
        >
          <defs>
            <radialGradient id="hallGlow" cx="50%" cy="18%" r="80%">
              <stop offset="0%" stopColor={SAGE} stopOpacity="0.07" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2.5" stdDeviation="3" floodColor="#000" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* Пол и стены */}
          <rect x="10" y="10" width={vbW - 20} height={vbH - 20} rx="16" fill="#15170F" />
          <rect x="10" y="10" width={vbW - 20} height={vbH - 20} rx="16" fill="url(#hallGlow)" />
          <rect x="10" y="10" width={vbW - 20} height={vbH - 20} rx="16" fill="none" stroke={WALL} strokeWidth="5" />

          <Fixtures />

          {/* Столы */}
          {placed.map(({ table, spot }) => (
            <TableShape
              key={table.id}
              table={table}
              spot={spot}
              active={table.id === selectedId}
              accentColor={accentColor}
              onSelect={onSelect}
            />
          ))}
        </svg>
      </div>

      {/* Легенда — только то, что реально есть в зале */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-1">
        {kindsPresent.has("BILLIARD_LARGE") && <Legend color={GOLD} label="Великі більярдні столи" />}
        {kindsPresent.has("BILLIARD_SMALL") && <Legend color={SAGE} label="Малі більярдні столи" />}
        {kindsPresent.has("DINING") && <Legend color={DECOR} label="Звичайні столи" />}
      </div>
    </div>
  );
}

// ─── Отрисовка одного стола ────────────────────────────────
function TableShape({
  table, spot, active, accentColor, onSelect,
}: {
  table: ReserveTable;
  spot: Spot;
  active: boolean;
  accentColor: string;
  onSelect: (t: ReserveTable) => void;
}) {
  const { x, y, w, h } = spot;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const isBilliard = table.kind !== "DINING";
  const rim = table.kind === "BILLIARD_LARGE" ? GOLD : table.kind === "BILLIARD_SMALL" ? SAGE : DECOR;

  return (
    <motion.g
      whileHover={{ opacity: 0.85 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => onSelect(table)}
      style={{ cursor: "pointer", transformOrigin: `${cx}px ${cy}px` }}
      filter="url(#softShadow)"
    >
      {isBilliard ? (
        <>
          {/* Борт */}
          <rect
            x={x} y={y} width={w} height={h} rx="8"
            fill="#26291C"
            stroke={active ? accentColor : rim}
            strokeWidth={active ? 3 : 1.6}
          />
          {/* Сукно */}
          <rect
            x={x + 6} y={y + 6} width={w - 12} height={h - 12} rx="5"
            fill={active ? FELT_LIGHT : FELT}
          />
          {/* Лузы */}
          {[
            [x + 7, y + 7], [x + w - 7, y + 7],
            [x + 7, y + h - 7], [x + w - 7, y + h - 7],
            ...(w > h
              ? [[cx, y + 6], [cx, y + h - 6]]
              : [[x + 6, cy], [x + w - 6, cy]]),
          ].map(([px, py], i) => (
            <circle key={i} cx={px} cy={py} r="2.6" fill="#141610" />
          ))}
          <text x={cx} y={cy + 5} textAnchor="middle" fill="#F2F1EA" fontSize="15" fontWeight="600">
            {table.number}
          </text>
        </>
      ) : (
        <>
          {/* Стулья вокруг */}
          {(table.seats >= 4
            ? [[cx, y - 7], [cx, y + h + 7], [x - 7, cy], [x + w + 7, cy]]
            : [[x - 7, cy], [x + w + 7, cy]]
          ).map(([px, py], i) => (
            <circle key={i} cx={px} cy={py} r="5.5" fill="#1C1F15" stroke={DECOR} strokeWidth="1.3" />
          ))}
          {/* Столешница */}
          <rect
            x={x} y={y} width={w} height={h} rx={Math.min(w, h) / 4}
            fill={active ? accentColor : "#2A2E24"}
            stroke={active ? accentColor : "#4A5040"}
            strokeWidth={active ? 2.5 : 1.4}
          />
          <text
            x={cx} y={cy + 5} textAnchor="middle"
            fill={active ? "#0E0F0C" : "#D9D8CC"} fontSize="14" fontWeight="500"
          >
            {table.number}
          </text>
        </>
      )}
    </motion.g>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[10px] text-muted">
      <span className="h-2.5 w-2.5 rounded-sm border" style={{ borderColor: color, background: color + "33" }} />
      {label}
    </span>
  );
}

// Запасной вариант — сетка кнопок (для заведений без схемы)
function TableChips({ tables, selectedId, accentColor, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {tables.map((t) => {
        const active = t.id === selectedId;
        return (
          <button
            key={t.id}
            onClick={() => onSelect(t)}
            className="rounded-xl border px-3.5 py-2.5 text-xs transition-all"
            style={
              active
                ? { background: accentColor, borderColor: accentColor, color: "#0E0F0C" }
                : { borderColor: "#2A2E24", color: "#9A9B90" }
            }
          >
            {TABLE_KIND_SHORT[t.kind]} №{t.number}
            <span className="opacity-60"> · {t.seats} міс.</span>
          </button>
        );
      })}
    </div>
  );
}
