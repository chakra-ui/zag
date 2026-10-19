"use client"

import {
  Glow,
  IsoText,
  Slab,
  isoVars,
  isoVarsLight,
  lift,
  pts,
  px,
  useStep,
} from "./hero-iso-kit"

const items = ["Edit", "Duplicate", "Archive", "Delete"]
const ROW = 34
const IX = 36
const IY = 38
const IW = 188
const ID = 26
const COL = 250

const layers = [
  {
    part: "positioner",
    note: "--x · --y · placement",
    anchor: [260, 0, 0],
    rest: 0,
    open: 0,
  },
  {
    part: "content",
    note: 'role="menu"',
    anchor: [240, 20, 8],
    rest: 4,
    open: 70,
  },
  {
    part: "item",
    note: 'role="menuitem"',
    anchor: [IX + IW, IY, 3],
    rest: 12,
    open: 140,
  },
  {
    part: "trigger",
    note: 'aria-expanded="true"',
    anchor: [140, -78, 10],
    rest: 0,
    open: 210,
  },
]

const script = [
  { open: false, hl: -1 },
  { open: true, hl: -1 },
  { open: true, hl: 0 },
  { open: true, hl: 1 },
  { open: true, hl: 2 },
  { open: true, hl: 3 },
  { open: true, hl: 3 },
  { open: false, hl: -1 },
]

const css = `
.zan { ${isoVars} }
html:not(.dark) .zan { ${isoVarsLight} }
.zan text { fill: var(--t); font-size: 11px; letter-spacing: .02em }
.zan .zan-move { transition: transform 800ms cubic-bezier(.65,0,.35,1) }
.zan .zan-fade { transition: opacity 500ms ease }
.zan .zan-tint { transition: fill 400ms ease }
@media (prefers-reduced-motion: reduce) { .zan .zan-move, .zan .zan-fade, .zan .zan-tint { transition: none } }
`

function Leader(props: {
  at: number[]
  part: string
  note: string
  show: boolean
}) {
  const [sx, sy] = px(props.at[0], props.at[1], props.at[2])
  return (
    <g className="zan-fade" style={{ opacity: props.show ? 1 : 0 }}>
      <path
        d={`M${sx + 6} ${sy} H${COL - 8}`}
        stroke="var(--l2)"
        strokeDasharray="2 3"
      />
      <circle cx={sx} cy={sy} r="2.5" fill="var(--l3)" />
      <text x={COL} y={sy - 2}>
        data-part=<tspan style={{ fill: "var(--tb)" }}>"{props.part}"</tspan>
      </text>
      <text x={COL} y={sy + 13} style={{ opacity: 0.7, fontSize: 10 }}>
        {props.note}
      </text>
    </g>
  )
}

export function HeroAnatomy() {
  const step = useStep(script.length, 1100, 4)
  const { open, hl } = script[step]
  const z = (i: number) => (open ? layers[i].open : layers[i].rest)
  const at = Math.max(hl, 0)
  const [lx, ly] = px(IX, IY + ID, 3)

  return (
    <svg
      className="zan"
      viewBox="-280 -270 710 520"
      width="100%"
      aria-label="A menu separates into its parts, positioner, content, items and trigger, each labelled with its data-part attribute, while the highlight steps through the items"
    >
      <style>{css}</style>
      <defs>
        <Glow id="zan-glow" blur={7} />
      </defs>

      <g
        className="zan-fade"
        stroke="var(--l)"
        strokeDasharray="1 4"
        style={{ opacity: open ? 1 : 0 }}
      >
        {[
          [260, 0],
          [260, 200],
          [0, 200],
        ].map(([x, y]) => (
          <polyline
            key={`${x}${y}`}
            points={pts([
              [x, y, 0],
              [x, y, 150],
            ])}
            fill="none"
          />
        ))}
      </g>

      <g className="zan-move" style={{ transform: lift(0, 0, z(0)) }}>
        <Slab x={0} y={0} w={260} d={200} stroke="var(--l3)" dashed />
        <Leader
          at={layers[0].anchor}
          part="positioner"
          note={layers[0].note}
          show={open}
        />
      </g>

      <g className="zan-move" style={{ transform: lift(0, 0, z(1)) }}>
        <Slab x={20} y={20} w={220} d={160} z={8} t={8} top="var(--top)" />
        <Leader
          at={layers[1].anchor}
          part="content"
          note={layers[1].note}
          show={open}
        />
      </g>

      <g className="zan-move" style={{ transform: lift(0, 0, z(2)) }}>
        <polygon
          className="zan-fade"
          points={pts([
            [IX, IY + at * ROW],
            [IX + IW, IY + at * ROW],
            [IX + IW, IY + at * ROW + ID],
            [IX, IY + at * ROW + ID],
          ])}
          fill="var(--ag)"
          filter="url(#zan-glow)"
          style={{ opacity: hl >= 0 ? 1 : 0 }}
        />
        {items.map((item, i) => {
          const on = i === hl
          const y = IY + i * ROW
          return (
            <g key={item}>
              <Slab
                x={IX}
                y={y}
                w={IW}
                d={ID}
                z={3}
                t={3}
                top="var(--top)"
                side={on ? "var(--aside)" : "var(--side)"}
                stroke={on ? "var(--a)" : "var(--l2)"}
              />
              <polygon
                className="zan-tint"
                points={pts([
                  [IX, y, 3],
                  [IX + IW, y, 3],
                  [IX + IW, y + ID, 3],
                  [IX, y + ID, 3],
                ])}
                fill={on ? "var(--as)" : "transparent"}
                stroke="none"
              />
              <IsoText x={IX + 14} y={y + ID / 2} z={3} size={12}>
                <tspan
                  className="zan-tint"
                  style={{ fill: on ? "var(--a)" : "var(--tb)" }}
                >
                  {item}
                </tspan>
              </IsoText>
            </g>
          )
        })}
        <Leader
          at={layers[2].anchor}
          part="item"
          note={layers[2].note}
          show={open}
        />
        <g className="zan-fade" style={{ opacity: hl >= 0 ? 1 : 0 }}>
          <g className="zan-move" style={{ transform: lift(0, at * ROW) }}>
            <path
              d={`M${lx - 6} ${ly} H${lx - 40}`}
              stroke="var(--a)"
              strokeDasharray="2 3"
            />
            <circle cx={lx} cy={ly} r="2.5" fill="var(--a)" />
            <text
              x={lx - 46}
              y={ly + 4}
              textAnchor="end"
              style={{ fill: "var(--a)" }}
            >
              data-highlighted
            </text>
          </g>
        </g>
      </g>

      <g className="zan-move" style={{ transform: lift(0, 0, z(3)) }}>
        <Slab
          x={20}
          y={-78}
          w={120}
          d={40}
          z={10}
          t={10}
          top="var(--top)"
          stroke={open ? "var(--l3)" : "var(--l2)"}
        />
        <IsoText x={36} y={-58} z={10} size={12}>
          <tspan style={{ fill: "var(--tb)" }}>Actions ▾</tspan>
        </IsoText>
        <Leader
          at={layers[3].anchor}
          part="trigger"
          note={layers[3].note}
          show={open}
        />
      </g>
    </svg>
  )
}
