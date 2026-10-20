"use client"

import { Fragment, useEffect, useState } from "react"
import {
  Glow,
  Guide,
  IsoGrid,
  IsoHandles,
  IsoText,
  Slab,
  isoVars,
  isoVarsLight,
  lift,
  pts,
  px,
  useStep,
} from "./hero-iso-kit"

const S = 96
const H = S / 2
const T = 12
const RISE = 12
const G = 250
const MOVE = 720
const B = 14

const states = [
  { name: "closed", x: 0, y: 0 },
  { name: "opening", x: G, y: 0 },
  { name: "open", x: G, y: G },
  { name: "closing", x: 0, y: G },
]

const events = ["OPEN", "ANIMATION.END", "CLOSE", "ANIMATION.END"]

const order = [0, 1, 3, 2]

const css = `
.zsf { ${isoVars} }
html:not(.dark) .zsf { ${isoVarsLight} }
.zsf text { fill: var(--t); font-size: 12px; letter-spacing: .02em }
.zsf .zsf-move { transition: transform ${MOVE}ms cubic-bezier(.65,0,.35,1) }
.zsf .zsf-rise { transition: transform 260ms cubic-bezier(.2,.8,.2,1) }
.zsf .zsf-fade { transition: opacity 260ms ease, stroke 260ms ease, fill 260ms ease }
.zsf .zsf-read text { font-size: 16px }
@keyframes zsf-pulse { 0% { opacity: .9; transform: scale(.6) } 100% { opacity: 0; transform: scale(2.4) } }
.zsf .zsf-pulse { transform-box: fill-box; transform-origin: center; animation: zsf-pulse 1800ms ease-out infinite }
@media (prefers-reduced-motion: reduce) { .zsf .zsf-move, .zsf .zsf-rise, .zsf .zsf-fade { transition: none } .zsf .zsf-pulse { animation: none; opacity: 0 } }
`

function Edge(props: {
  from: (typeof states)[number]
  to: (typeof states)[number]
  label: string
  active: boolean
}) {
  const { from, to } = props
  const dx = Math.sign(to.x - from.x)
  const dy = Math.sign(to.y - from.y)
  const g = H + 14
  const a: [number, number] = [from.x + dx * g, from.y + dy * g]
  const b: [number, number] = [to.x - dx * g, to.y - dy * g]
  const ox = dy
  const oy = -dx
  const head: [number, number][] = [
    [b[0] - dx * 9 + ox * 5, b[1] - dy * 9 + oy * 5],
    b,
    [b[0] - dx * 9 - ox * 5, b[1] - dy * 9 - oy * 5],
  ]
  const mx = (a[0] + b[0]) / 2 + ox * 20 - Math.abs(dx) * 10
  const my = (a[1] + b[1]) / 2 + oy * 20 - Math.abs(dy) * 10
  const stroke = props.active ? "var(--a)" : "var(--l2)"
  return (
    <g>
      <polyline
        className="zsf-fade"
        points={pts([a, b])}
        stroke={stroke}
        fill="none"
      />
      <polyline
        className="zsf-fade"
        points={pts(head)}
        stroke={stroke}
        fill="none"
        strokeLinejoin="round"
      />
      <g className="zsf-fade" style={{ opacity: 1 }}>
        <IsoText
          x={mx}
          y={my}
          axis={dx !== 0 ? "x" : "y"}
          anchor="middle"
          size={14}
        >
          <tspan style={{ fill: props.active ? "var(--a)" : undefined }}>
            {props.label}
          </tspan>
        </IsoText>
      </g>
    </g>
  )
}

export function HeroStatefloor() {
  const step = useStep(4, 1800, 2)
  const [at, setAt] = useState(step)
  useEffect(() => {
    const id = setTimeout(() => setAt(step), MOVE * 0.78)
    return () => clearTimeout(id)
  }, [step])
  const cur = states[step]
  const here = states[at]
  const [cx, cy] = px(G / 2, G / 2)

  return (
    <svg
      className="zsf"
      viewBox="-320 -100 640 420"
      width="100%"
      aria-label="A statechart laid out as a floor: closed, opening, open and closing tiles joined by event arrows, with a glowing token stepping from state to state"
    >
      <style>{css}</style>
      <defs>
        <Glow id="zsf-glow" blur={10} />
        <Glow id="zsf-glow-sm" blur={3} />
        <radialGradient id="zsf-fade">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <mask id="zsf-mask">
          <rect
            x="-340"
            y="-120"
            width="680"
            height="460"
            fill="url(#zsf-fade)"
          />
        </mask>
      </defs>

      <IsoGrid from={-120} to={370} step={24} maskId="zsf-mask" />

      <g stroke="var(--l2)" fill="none">
        <polyline
          points={pts([
            [-104, 0],
            [-H - 14, 0],
          ])}
        />
        <polyline
          points={pts([
            [-H - 23, -5],
            [-H - 14, 0],
            [-H - 23, 5],
          ])}
        />
      </g>
      <circle cx={px(-108, 0)[0]} cy={px(-108, 0)[1]} r="3" fill="var(--l3)" />
      <IsoText x={-112} y={-14} size={11} axis="x">
        initial
      </IsoText>
      <Slab
        x={-H - B}
        y={-H - B}
        w={G + S + 2 * B}
        d={G + S + 2 * B}
        stroke="var(--k)"
        dashed
      />
      <IsoHandles
        x={-H - B}
        y={-H - B}
        w={G + S + 2 * B}
        d={G + S + 2 * B}
        s={5}
      />
      <IsoText x={-30} y={G + H + B + 12} size={11}>
        menu · 4 states · 4 events
      </IsoText>

      {states.map((s, i) => (
        <Edge
          key={s.name}
          from={s}
          to={states[(i + 1) % 4]}
          label={events[i]}
          active={step === (i + 1) % 4}
        />
      ))}

      {order.map((i) => {
        const s = states[i]
        const on = i === at
        return (
          <Fragment key={s.name}>
            <polygon
              className="zsf-fade"
              points={pts([
                [s.x - H, s.y - H],
                [s.x + H, s.y - H],
                [s.x + H, s.y + H],
                [s.x - H, s.y + H],
              ])}
              fill="var(--ag)"
              filter="url(#zsf-glow)"
              style={{ opacity: on ? 1 : 0 }}
            />
            <g
              className="zsf-rise"
              style={{ transform: lift(0, 0, on ? RISE : 0) }}
            >
              <Slab
                x={s.x - H}
                y={s.y - H}
                w={S}
                d={S}
                z={T}
                t={T}
                top="var(--top)"
                side={on ? "var(--aside)" : "var(--side)"}
                stroke={on ? "var(--a)" : "var(--l2)"}
                className="zsf-fade"
              />
              <IsoHandles
                x={s.x - H}
                y={s.y - H}
                w={S}
                d={S}
                z={T}
                s={5}
                on
                className="zsf-fade"
                style={{ opacity: on ? 1 : 0 }}
              />
              {on && (
                <polygon
                  points={pts([
                    [s.x - H, s.y - H, T],
                    [s.x + H, s.y - H, T],
                    [s.x + H, s.y + H, T],
                    [s.x - H, s.y + H, T],
                  ])}
                  fill="var(--as)"
                />
              )}
              <IsoText x={s.x - H + 12} y={s.y + H - 16} z={T} size={15}>
                <tspan style={{ fill: on ? "var(--a)" : "var(--tb)" }}>
                  {s.name}
                </tspan>
              </IsoText>
            </g>
          </Fragment>
        )
      })}

      <g
        className="zsf-move"
        style={{ transform: lift(cur.x, cur.y, T + RISE) }}
      >
        <ellipse
          cx="0"
          cy="0"
          rx="13"
          ry="7.5"
          fill="var(--ag)"
          filter="url(#zsf-glow-sm)"
        />
        <ellipse
          className="zsf-pulse"
          cx="0"
          cy="0"
          rx="9"
          ry="5.2"
          fill="none"
          stroke="var(--a)"
        />
        <ellipse cx="0" cy="0" rx="6" ry="3.5" fill="var(--a)" />
      </g>
      <g className="zsf-move" style={{ transform: lift(cur.x, cur.y, 0) }}>
        <Guide from={[0, 0, 0]} to={[0, 0, T + RISE]} />
      </g>

      <g
        className="zsf-read"
        transform={`translate(${cx} ${cy})`}
        textAnchor="middle"
      >
        <text x="0" y="-7">
          state: <tspan style={{ fill: "var(--a)" }}>{here.name}</tspan>
        </text>
        <text x="0" y="15">
          event:{" "}
          <tspan style={{ fill: "var(--tb)" }}>{events[(at + 3) % 4]}</tspan>
        </text>
      </g>
    </svg>
  )
}
