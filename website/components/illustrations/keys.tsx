"use client"

import { useEffect, useRef, useState } from "react"
import {
  Glow,
  IsoHandles,
  IsoText,
  Slab,
  isoVars,
  isoVarsLight,
  lift,
  pts,
  px,
  useStep,
} from "./iso-kit"

const keys = [
  { glyph: "↑", event: "ARROW_UP", y: 0 },
  { glyph: "↓", event: "ARROW_DOWN", y: 50 },
  { glyph: "↵", event: "ENTER", y: 100 },
  { glyph: "esc", event: "ESCAPE", y: 150 },
]

const items = ["edit", "duplicate", "archive", "delete"]

const script = [
  { key: 1, hl: 0 },
  { key: 1, hl: 1 },
  { key: 1, hl: 2 },
  { key: 0, hl: 1 },
  { key: 2, hl: 1 },
  { key: 3, hl: -1 },
]

const KX = -200
const KW = 40
const BUS = -128
const LANE = 95
const CHIP = [-92, 65, 56, 60] as const
const MX = 20
const MW = 220
const MD = 190
const ROW = 42
const IY = 20
const ID = 30
const MS = 1500
const TRAVEL = 640
const RY = 96

const css = `
.zik { ${isoVars} }
html:not(.dark) .zik { ${isoVarsLight} }
.zik text { fill: var(--t); font-size: 13px; letter-spacing: .02em }
.zik .zik-key { transition: transform 140ms cubic-bezier(.3,0,.2,1) }
.zik .zik-move { transition: transform 520ms cubic-bezier(.65,0,.35,1) }
.zik .zik-fade { transition: opacity 400ms ease, fill 400ms ease, stroke 400ms ease }
@media (prefers-reduced-motion: reduce) { .zik .zik-key, .zik .zik-move, .zik .zik-fade { transition: none } }
`

function route(k: number): [number, number][] {
  const ky = keys[k].y + KW / 2
  return [
    [KX + KW, ky],
    [BUS, ky],
    [BUS, LANE],
    [MX, LANE],
  ]
}

function along(path: [number, number][], t: number) {
  const segs = path
    .slice(1)
    .map((p, i) => Math.abs(p[0] - path[i][0]) + Math.abs(p[1] - path[i][1]))
  let d = t * segs.reduce((a, b) => a + b, 0)
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i] || i === segs.length - 1) {
      const f = segs[i] ? Math.min(d / segs[i], 1) : 1
      const [a, b] = [path[i], path[i + 1]]
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]
    }
    d -= segs[i]
  }
  return path[0]
}

export function HeroIsoKeys() {
  const step = useStep(script.length, MS, 1)
  const [applied, setApplied] = useState(1)
  const [pressed, setPressed] = useState(-1)
  const [inChip, setInChip] = useState(false)
  const packet = useRef<SVGGElement>(null)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const { key } = script[step]
    const path = route(key)
    const start = performance.now() + 120
    let raf = 0
    setPressed(key)
    const up = setTimeout(() => setPressed(-1), 260)
    const tick = (now: number) => {
      const t = Math.min(Math.max((now - start) / TRAVEL, 0), 1)
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
      const [ix, iy] = along(path, e)
      const chip =
        iy === LANE && ix >= CHIP[0] - 4 && ix <= CHIP[0] + CHIP[2] + 4
      const [x, y] = px(ix, iy, 2)
      const el = packet.current
      if (el) {
        el.style.transform = `translate(${x}px, ${y}px)`
        el.style.opacity = t <= 0 || t >= 1 || chip ? "0" : "1"
      }
      setInChip(chip)
      if (t < 1) raf = requestAnimationFrame(tick)
      else setApplied(step)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(up)
    }
  }, [step])

  const { hl, key } = script[applied]
  const open = hl >= 0
  const at = Math.max(hl, 0)
  const [cx, cy, cw, cd] = CHIP
  const [lx, ly] = px(MX + 20, IY + at * ROW + ID / 2, 11)

  return (
    <svg
      className="zik"
      viewBox="-362 -140 600 400"
      width="100%"
      aria-label="Keyboard keys send events along a wire into the menu machine, which moves the highlighted item and updates aria-activedescendant"
    >
      <style>{css}</style>
      <defs>
        <Glow id="zik-glow" blur={7} />
        <Glow id="zik-glow-sm" blur={3} />
      </defs>

      <g fill="none" stroke="var(--l2)" strokeLinejoin="round">
        {keys.map((k) => (
          <polyline
            key={k.glyph}
            points={pts([
              [KX + KW, k.y + KW / 2],
              [BUS, k.y + KW / 2],
            ])}
          />
        ))}
        <polyline
          points={pts([
            [BUS, keys[0].y + KW / 2],
            [BUS, keys[3].y + KW / 2],
          ])}
        />
        <polyline
          points={pts([
            [BUS, LANE],
            [cx, LANE],
          ])}
        />
        <polyline
          points={pts([
            [cx + cw, LANE],
            [MX, LANE],
          ])}
        />
      </g>
      {keys.map((k) => {
        const [x, y] = px(BUS, k.y + KW / 2)
        return <circle key={k.glyph} cx={x} cy={y} r="2" fill="var(--l3)" />
      })}

      {[...keys].reverse().map((k, ri) => {
        const i = keys.length - 1 - ri
        const down = pressed === i
        return (
          <g
            key={k.glyph}
            className="zik-key"
            style={{ transform: lift(0, 0, down ? -7 : 0) }}
          >
            <Slab
              x={KX}
              y={k.y}
              w={KW}
              d={KW}
              z={14}
              t={14}
              top="var(--top)"
              side={down ? "var(--aside)" : "var(--side)"}
              stroke={down ? "var(--a)" : "var(--l2)"}
              className="zik-fade"
            />
            <IsoText
              x={KX + KW / 2}
              y={k.y + KW / 2}
              z={14}
              size={k.glyph.length > 1 ? 13 : 20}
              anchor="middle"
            >
              <tspan style={{ fill: down ? "var(--a)" : "var(--tb)" }}>
                {k.glyph}
              </tspan>
            </IsoText>
          </g>
        )
      })}

      <Slab
        x={cx}
        y={cy}
        w={cw}
        d={cd}
        z={18}
        t={18}
        top="var(--top)"
        side={inChip ? "var(--aside)" : "var(--side)"}
        stroke={inChip ? "var(--a)" : "var(--l3)"}
        className="zik-fade"
      />
      <IsoHandles x={cx} y={cy} w={cw} d={cd} z={18} s={4} on={inChip} />
      <IsoText x={cx + cw / 2} y={cy + cd / 2} z={18} size={12} anchor="middle">
        <tspan style={{ fill: inChip ? "var(--a)" : "var(--tb)" }}>
          machine
        </tspan>
      </IsoText>

      <Slab
        x={MX}
        y={0}
        w={MW}
        d={MD}
        z={8}
        t={8}
        top="var(--top)"
        stroke="var(--l2)"
      />
      <g className="zik-fade" style={{ opacity: open ? 1 : 0.35 }}>
        <polygon
          className="zik-move"
          points={pts([
            [MX + 20, IY],
            [MX + MW - 20, IY],
            [MX + MW - 20, IY + ID],
            [MX + 20, IY + ID],
          ])}
          fill="var(--ag)"
          filter="url(#zik-glow)"
          style={{ transform: lift(0, at * ROW, 10), opacity: open ? 1 : 0 }}
        />
        {items.map((item, i) => {
          const on = i === hl
          const y = IY + i * ROW
          return (
            <g key={item}>
              <Slab
                x={MX + 20}
                y={y}
                w={MW - 40}
                d={ID}
                z={11}
                t={3}
                top="var(--top)"
                side={on ? "var(--aside)" : "var(--side)"}
                stroke={on ? "var(--a)" : "var(--l2)"}
                className="zik-fade"
              />
              <polygon
                className="zik-fade"
                points={pts([
                  [MX + 20, y, 11],
                  [MX + MW - 20, y, 11],
                  [MX + MW - 20, y + ID, 11],
                  [MX + 20, y + ID, 11],
                ])}
                fill={on ? "var(--as)" : "transparent"}
                stroke="none"
              />
              <IsoText x={MX + 32} y={y + ID / 2} z={11} size={14}>
                <tspan style={{ fill: on ? "var(--a)" : "var(--tb)" }}>
                  {item}
                </tspan>
              </IsoText>
            </g>
          )
        })}
      </g>

      <g ref={packet} style={{ opacity: 0 }}>
        <circle r="9" fill="var(--ag)" filter="url(#zik-glow-sm)" />
        <circle r="3.5" fill="var(--a)" />
      </g>

      <IsoHandles x={MX} y={0} w={MW} d={MD} z={8} s={4} />

      <g className="zik-fade" style={{ opacity: open ? 1 : 0 }}>
        <path
          d={`M-176 ${RY + 17} L${lx - 6} ${ly}`}
          stroke="var(--k)"
          strokeDasharray="1 3"
          fill="none"
        />
        <circle cx={lx} cy={ly} r="2.5" fill="var(--a)" />
      </g>

      <g transform={`translate(-348 ${RY})`}>
        <text x="0" y="0">
          send(<tspan style={{ fill: "var(--tb)" }}>"{keys[key].event}"</tspan>)
        </text>
        <text x="0" y="22">
          aria-activedescendant
        </text>
        <text x="0" y="40">
          ={" "}
          <tspan style={{ fill: "var(--a)" }}>
            {open ? `"menu:${items[hl]}"` : "undefined"}
          </tspan>
        </text>
      </g>
    </svg>
  )
}
