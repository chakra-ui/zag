"use client"

import { useEffect, useState, type CSSProperties } from "react"
import {
  C,
  Glow,
  IsoHandles,
  IsoText,
  Slab,
  isoVars,
  isoVarsLight,
  pts,
  px,
  useStep,
} from "./hero-iso-kit"

const MS = 1400
const TRAVEL = 760
const AW = 72
const MW = 116
const MT = 18

const adapters = [
  { name: "react", label: "htmlFor", change: "onChange" },
  { name: "vue", label: "for", change: "onInput" },
  { name: "svelte", label: "for", change: "oninput" },
  { name: "solid", label: "for", change: "onInput" },
  { name: "preact", label: "htmlFor", change: "onInput" },
].map((a, i) => {
  const phi = ((-90 + 72 * i) * Math.PI) / 180
  const sx = Math.round(236 * Math.cos(phi))
  const sy = Math.round(132 * Math.sin(phi) - 6)
  const x = Math.round((sx / C + 2 * sy) / 2)
  const y = Math.round((2 * sy - sx / C) / 2)
  return { ...a, x, y, sy }
})

const css = `
.zad { ${isoVars} }
html:not(.dark) .zad { ${isoVarsLight} }
.zad text { fill: var(--t); font-size: 12px; letter-spacing: .02em }
.zad .zad-fade { transition: opacity 300ms ease, stroke 300ms ease, fill 300ms ease }
@keyframes zad-go {
  0% { transform: translate(var(--x0), var(--y0)); opacity: 0 }
  12% { opacity: 1 }
  88% { opacity: 1 }
  100% { transform: translate(var(--x1), var(--y1)); opacity: 0 }
}
.zad .zad-pk { animation: zad-go ${TRAVEL}ms cubic-bezier(.65,0,.35,1) 120ms both }
@media (prefers-reduced-motion: reduce) { .zad .zad-fade { transition: none } .zad .zad-pk { animation: none; opacity: 0 } }
`

function at(a: { x: number; y: number }, f: number, z = 0) {
  return px(a.x * f, a.y * f, z)
}

export function IsoAdapters() {
  const step = useStep(adapters.length, MS, 2)
  const [hit, setHit] = useState(step)
  useEffect(() => {
    const id = setTimeout(() => setHit(step), TRAVEL)
    return () => clearTimeout(id)
  }, [step])
  const go = adapters[step]
  const on = adapters[hit]
  const [x0, y0] = at(go, 0.36, 2)
  const [x1, y1] = at(go, 0.74, 2)
  const H = MW / 2

  const back = adapters.filter((a) => a.sy < 0)
  const front = adapters.filter((a) => a.sy >= 0)

  const Adapter = (a: (typeof adapters)[number]) => {
    const lit = a === on
    return (
      <g key={a.name}>
        <Slab
          x={a.x - AW / 2}
          y={a.y - AW / 2}
          w={AW}
          d={AW}
          z={10}
          t={10}
          top="var(--top)"
          side={lit ? "var(--aside)" : "var(--side)"}
          stroke={lit ? "var(--a)" : "var(--l2)"}
          className="zad-fade"
        />
        <polygon
          className="zad-fade"
          points={pts([
            [a.x - AW / 2, a.y - AW / 2, 10],
            [a.x + AW / 2, a.y - AW / 2, 10],
            [a.x + AW / 2, a.y + AW / 2, 10],
            [a.x - AW / 2, a.y + AW / 2, 10],
          ])}
          fill="var(--as)"
          stroke="none"
          style={{ opacity: lit ? 1 : 0 }}
        />
        <IsoText x={a.x} y={a.y} z={10} anchor="middle" size={13}>
          <tspan
            className="zad-fade"
            style={{ fill: lit ? "var(--a)" : "var(--tb)" }}
          >
            {a.name}
          </tspan>
        </IsoText>
        <IsoHandles
          x={a.x - AW / 2}
          y={a.y - AW / 2}
          w={AW}
          d={AW}
          z={10}
          s={4}
          on
          className="zad-fade"
          style={{ opacity: lit ? 1 : 0 }}
        />
      </g>
    )
  }

  return (
    <svg
      className="zad"
      viewBox="-320 -206 640 440"
      width="100%"
      aria-label="One machine slab in the centre wired to five adapter slabs, react, vue, svelte, solid and preact. A props packet travels out to each adapter in turn and the readout shows how that adapter's normalizeProps names the label and change props"
    >
      <style>{css}</style>
      <defs>
        <Glow id="zad-glow" blur={3} />
        <Glow id="zad-glow-lg" blur={10} />
      </defs>

      <ellipse
        cx="0"
        cy="-6"
        rx="236"
        ry="132"
        fill="none"
        stroke="var(--k)"
        strokeDasharray="1 3"
      />
      <polyline
        points="-262,-6 262,-6"
        stroke="var(--k)"
        strokeDasharray="1 3"
        fill="none"
      />
      <polyline
        points="0,-170 0,150"
        stroke="var(--k)"
        strokeDasharray="1 3"
        fill="none"
      />

      <g fill="none">
        {adapters.map((a) => {
          const lit = a === go || a === on
          return (
            <polyline
              key={a.name}
              className="zad-fade"
              points={pts([
                [a.x * 0.3, a.y * 0.3],
                [a.x * 0.8, a.y * 0.8],
              ])}
              stroke={lit ? "var(--a)" : "var(--l2)"}
            />
          )
        })}
      </g>
      {adapters.map((a) => {
        const [sx, sy] = at(a, 0.8)
        return <circle key={a.name} cx={sx} cy={sy} r="2" fill="var(--l3)" />
      })}

      {back.map(Adapter)}

      <polygon
        points={pts([
          [-H, -H],
          [H, -H],
          [H, H],
          [-H, H],
        ])}
        fill="var(--ag)"
        filter="url(#zad-glow-lg)"
        opacity={0.5}
      />
      <Slab
        x={-H}
        y={-H}
        w={MW}
        d={MW}
        z={MT}
        t={MT}
        top="var(--top)"
        stroke="var(--l3)"
      />
      <IsoText x={-H + 16} y={H - 34} z={MT} size={14}>
        <tspan style={{ fill: "var(--tb)" }}>machine</tspan>
      </IsoText>
      <IsoText x={-H + 16} y={H - 16} z={MT} size={11}>
        connect()
      </IsoText>
      <IsoHandles x={-H} y={-H} w={MW} d={MW} z={MT} s={4} />

      {front.map(Adapter)}

      <g
        key={step}
        className="zad-pk"
        style={
          {
            "--x0": `${x0}px`,
            "--y0": `${y0}px`,
            "--x1": `${x1}px`,
            "--y1": `${y1}px`,
          } as CSSProperties
        }
      >
        <circle r="9" fill="var(--ag)" filter="url(#zad-glow)" />
        <circle r="3.5" fill="var(--a)" />
      </g>

      <g transform="translate(0 196)" textAnchor="middle">
        <text>
          @zag-js/<tspan style={{ fill: "var(--a)" }}>{on.name}</tspan>
          <tspan dx={14}>label </tspan>
          <tspan style={{ fill: "var(--tb)" }}>{on.label}</tspan>
          <tspan dx={14}>change </tspan>
          <tspan style={{ fill: "var(--tb)" }}>{on.change}</tspan>
        </text>
      </g>
    </svg>
  )
}
