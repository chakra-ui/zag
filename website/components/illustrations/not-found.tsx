"use client"

import { Fragment } from "react"
import {
  Glow,
  Guide,
  IsoGrid,
  IsoHandles,
  IsoText,
  Slab,
  ease,
  isoVars,
  isoVarsLight,
  lift,
  pts,
  px,
  ramp,
  useClock,
} from "./iso-kit"

const S = 96
const H = S / 2
const T = 12
const RISE = 14
const G = 200

const LOOP = 7400
const M1 = 700
const M2 = 2300
const MOVE = 800
const ARRIVE = M2 + MOVE
const DROP = 6500
const STILL = 4800

type Tile = { name: string; x: number; y: number }

const idle: Tile = { name: "idle", x: 0, y: 0 }
const loading: Tile = { name: "loading", x: G, y: 0 }
const missing: Tile = { name: "not_found", x: G, y: G + 30 }
const page: Tile = { name: "page", x: 2 * G, y: 0 }

const tiles = [idle, loading, missing]

const css = `
.znf { ${isoVars} }
html:not(.dark) .znf { ${isoVarsLight} }
.znf text { fill: var(--t); font-size: 12px; letter-spacing: .02em }
.znf .znf-read { margin-top: 14px; font-size: 12px; color: var(--t) }
.znf .znf-read b { font-weight: 400; color: var(--a) }
@keyframes znf-pulse { 0% { opacity: .9; transform: scale(.6) } 100% { opacity: 0; transform: scale(2.4) } }
.znf .znf-pulse { transform-box: fill-box; transform-origin: center; animation: znf-pulse 1800ms ease-out infinite }
@media (prefers-reduced-motion: reduce) { .znf .znf-pulse { animation: none; opacity: 0 } }
`

function Edge(props: {
  from: Tile
  to: Tile
  label: string
  on: boolean
  end?: number
}) {
  const { from, to } = props
  const dx = Math.sign(to.x - from.x)
  const dy = Math.sign(to.y - from.y)
  const g = H + 20
  const a: [number, number] = [from.x + dx * g, from.y + dy * g]
  const e = g + (props.end ?? 0)
  const b: [number, number] = [to.x - dx * e, to.y - dy * e]
  const ox = dy
  const oy = -dx
  const head: [number, number][] = [
    [b[0] - dx * 9 + ox * 5, b[1] - dy * 9 + oy * 5],
    b,
    [b[0] - dx * 9 - ox * 5, b[1] - dy * 9 - oy * 5],
  ]
  const mx = (a[0] + b[0]) / 2 + ox * 20 - Math.abs(dx) * 6
  const my = (a[1] + b[1]) / 2 + oy * 20 - Math.abs(dy) * 6
  const stroke = props.on ? "var(--a)" : "var(--l2)"
  return (
    <g>
      <polyline points={pts([a, b])} stroke={stroke} fill="none" />
      <polyline
        points={pts(head)}
        stroke={stroke}
        fill="none"
        strokeLinejoin="round"
      />
      <IsoText
        x={mx}
        y={my}
        axis={dx !== 0 ? "x" : "y"}
        anchor="middle"
        size={13}
      >
        <tspan style={{ fill: props.on ? "var(--a)" : undefined }}>
          {props.label}
        </tspan>
      </IsoText>
    </g>
  )
}

const mix = (a: Tile, b: Tile, k: number): [number, number] => [
  a.x + (b.x - a.x) * k,
  a.y + (b.y - a.y) * k,
]

export function IsoNotFound() {
  const [clock, ref] = useClock<HTMLDivElement>(STILL)
  const t = clock % LOOP

  const k1 = ease(ramp(t, M1, MOVE))
  const k2 = ease(ramp(t, M2, MOVE))
  const r = ease(ramp(t, ARRIVE, 450)) * (1 - ease(ramp(t, DROP, 450)))
  const ghost = ease(ramp(t, ARRIVE + 300, 500)) * (1 - ramp(t, DROP, 400))
  const fade = Math.min(ramp(t, 0, 300), 1 - ramp(t, DROP + 300, 300))

  const at = t < M1 + MOVE / 2 ? 0 : t < M2 + MOVE / 2 ? 1 : 2
  const pos = t < M2 ? mix(idle, loading, k1) : mix(loading, missing, k2)
  const z = T + RISE * r
  const name = tiles[at].name

  return (
    <div className="znf" ref={ref}>
      <style>{css}</style>
      <svg
        viewBox="-128 -96 580 384"
        width="100%"
        aria-hidden="true"
        style={{ display: "block", maxWidth: 580 }}
      >
        <defs>
          <Glow id="znf-glow" blur={10} />
          <Glow id="znf-glow-sm" blur={3} />
          <radialGradient id="znf-fade">
            <stop offset="0" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </radialGradient>
          <mask id="znf-mask">
            <rect
              x="-150"
              y="-110"
              width="600"
              height="400"
              fill="url(#znf-fade)"
            />
          </mask>
        </defs>

        <IsoGrid from={-96} to={2 * G + 96} step={24} maskId="znf-mask" />

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
        <circle
          cx={px(-108, 0)[0]}
          cy={px(-108, 0)[1]}
          r="3"
          fill="var(--l3)"
        />
        <IsoText x={-112} y={-18} size={11} axis="x">
          initial
        </IsoText>

        <g style={{ opacity: 0.55 + 0.45 * ghost }}>
          <Slab
            x={page.x - H}
            y={page.y - H}
            w={S}
            d={S}
            stroke={ghost > 0.5 ? "var(--l3)" : "var(--k)"}
            dashed
          />
          <IsoHandles x={page.x - H} y={page.y - H} w={S} d={S} s={5} />
          <IsoText x={page.x - H + 10} y={page.y + H - 16} size={14}>
            page
          </IsoText>
          <IsoText x={page.x - H + 4} y={page.y + H + 16} size={10}>
            no event leads here
          </IsoText>
        </g>
        <Guide from={[G + H + 20, 0]} to={[page.x - H - 20, 0]} />

        <Edge
          from={idle}
          to={loading}
          label="NAVIGATE"
          on={t >= M1 && t < M2}
        />
        <Edge
          from={loading}
          to={missing}
          label="MISS"
          on={t >= M2 && t < DROP}
          end={16}
        />

        {tiles.map((s, i) => {
          const on = i === at
          const up = i === 2 ? r : 0
          const live = on && fade > 0.5
          return (
            <Fragment key={s.name}>
              {i === 2 && (
                <polygon
                  points={pts([
                    [s.x - H, s.y - H],
                    [s.x + H, s.y - H],
                    [s.x + H, s.y + H],
                    [s.x - H, s.y + H],
                  ])}
                  fill="var(--ag)"
                  filter="url(#znf-glow)"
                  style={{ opacity: r }}
                />
              )}
              <g style={{ transform: lift(0, 0, RISE * up) }}>
                <Slab
                  x={s.x - H}
                  y={s.y - H}
                  w={S}
                  d={S}
                  z={T}
                  t={T}
                  top="var(--top)"
                  side={i === 2 && r > 0.5 ? "var(--aside)" : "var(--side)"}
                  stroke={live ? "var(--a)" : "var(--l2)"}
                />
                {live && (
                  <>
                    <IsoHandles
                      x={s.x - H}
                      y={s.y - H}
                      w={S}
                      d={S}
                      z={T}
                      s={5}
                      on
                    />
                    <polygon
                      points={pts([
                        [s.x - H, s.y - H, T],
                        [s.x + H, s.y - H, T],
                        [s.x + H, s.y + H, T],
                        [s.x - H, s.y + H, T],
                      ])}
                      fill="var(--as)"
                    />
                  </>
                )}
                <IsoText x={s.x - H + 10} y={s.y + H - 16} z={T} size={14}>
                  <tspan style={{ fill: live ? "var(--a)" : "var(--tb)" }}>
                    {s.name}
                  </tspan>
                </IsoText>
              </g>
            </Fragment>
          )
        })}

        <g style={{ transform: lift(pos[0], pos[1], z), opacity: fade }}>
          <ellipse
            cx="0"
            cy="0"
            rx="13"
            ry="7.5"
            fill="var(--ag)"
            filter="url(#znf-glow-sm)"
          />
          <ellipse
            className="znf-pulse"
            cx="0"
            cy="0"
            rx="9"
            ry="5.2"
            fill="none"
            stroke="var(--a)"
          />
          <ellipse cx="0" cy="0" rx="6" ry="3.5" fill="var(--a)" />
        </g>
      </svg>
      <p className="znf-read">
        route.state = <b>&quot;{name}&quot;</b>
      </p>
    </div>
  )
}
