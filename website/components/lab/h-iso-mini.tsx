"use client"

import type { CSSProperties, ReactNode } from "react"
import type { DiagramKey } from "./guide-copy"
import {
  Guide,
  IsoText,
  Slab,
  isoVars,
  isoVarsLight,
  pts,
} from "./hero-iso-kit"

const css = `
.zhm { ${isoVars} display: block; overflow: visible }
html:not(.dark) .zhm { ${isoVarsLight} }
.zhm text { fill: var(--t); letter-spacing: .02em }
.zhm .zhm-hi { opacity: 0 }
@keyframes zhm-float { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
@keyframes zhm-step { 0%, 30% { transform: translateY(-5px) } 36%, 100% { transform: translateY(0) } }
@keyframes zhm-stepHi { 0%, 30% { opacity: 1 } 36%, 100% { opacity: 0 } }
@keyframes zhm-press { 0%, 6% { transform: translateY(0) } 10%, 18% { transform: translateY(3px) } 24%, 100% { transform: translateY(0) } }
@keyframes zhm-hit { 0%, 18% { opacity: 0 } 26%, 50% { opacity: 1 } 70%, 100% { opacity: 0 } }
@keyframes zhm-ping { 0%, 22% { opacity: 1 } 28%, 100% { opacity: 0 } }
@keyframes zhm-ring { 0%, 100% { opacity: .35 } 50% { opacity: 1 } }
@keyframes zhm-march { to { stroke-dashoffset: -14 } }
.zhm .zhm-float { animation: zhm-float 3.2s ease-in-out infinite }
.zhm .zhm-step { animation: zhm-step 3.6s ease-in-out infinite }
.zhm .zhm-step .zhm-hi { animation: zhm-stepHi 3.6s ease-in-out infinite; animation-delay: inherit }
.zhm .zhm-press { animation: zhm-press 2.6s ease-in-out infinite }
.zhm .zhm-hit { animation: zhm-hit 2.6s ease-in-out infinite }
.zhm .zhm-ping { animation: zhm-ping 3.2s ease-in-out infinite }
.zhm .zhm-ring { animation: zhm-ring 2.4s ease-in-out infinite, zhm-march 1.4s linear infinite }
@media (prefers-reduced-motion: reduce) {
  .zhm * { animation: none !important }
  .zhm .zhm-still { transform: translateY(-5px) }
  .zhm .zhm-still .zhm-hi, .zhm .zhm-hit, .zhm .zhm-ping.zhm-still { opacity: 1 }
}
`

const top = (x: number, y: number, w: number, d: number, z: number) =>
  pts([
    [x, y, z],
    [x + w, y, z],
    [x + w, y + d, z],
    [x, y + d, z],
  ])

function Hi(props: {
  x: number
  y: number
  w: number
  d: number
  z: number
  className?: string
  style?: CSSProperties
}) {
  return (
    <polygon
      className={props.className ?? "zhm-hi"}
      style={props.style}
      points={top(props.x, props.y, props.w, props.d, props.z)}
      fill="var(--as)"
      stroke="var(--a)"
    />
  )
}

function Arrow(props: {
  from: [number, number]
  to: [number, number]
  on?: boolean
}) {
  const [ax, ay] = props.from
  const [bx, by] = props.to
  const l = Math.hypot(bx - ax, by - ay)
  const dx = (bx - ax) / l
  const dy = (by - ay) / l
  const head: [number, number][] = [
    [bx - dx * 5 - dy * 3, by - dy * 5 + dx * 3],
    [bx, by],
    [bx - dx * 5 + dy * 3, by - dy * 5 - dx * 3],
  ]
  const stroke = props.on ? "var(--a)" : "var(--l2)"
  return (
    <g fill="none" stroke={stroke} strokeLinejoin="round">
      <polyline points={pts([props.from, props.to])} />
      <polyline points={pts(head)} />
    </g>
  )
}

function Principles() {
  const s = 56
  const o = -s / 2
  return (
    <g transform="translate(0 16)">
      <Slab x={o} y={o} w={s} d={s} z={0} t={3} top="var(--top)" />
      <Slab x={o} y={o} w={s} d={s} z={16} t={3} top="var(--top)" />
      <Guide from={[o + s, o + s, 0]} to={[o + s, o + s, 34]} />
      <Guide from={[o, o + s, 0]} to={[o, o + s, 34]} />
      <Guide from={[o + s, o, 0]} to={[o + s, o, 34]} />
      <g className="zhm-float">
        <Slab
          x={o}
          y={o}
          w={s}
          d={s}
          z={32}
          t={3}
          top="var(--top)"
          stroke="var(--a)"
          side="var(--aside)"
        />
        <Hi x={o} y={o} w={s} d={s} z={32} className="" />
      </g>
    </g>
  )
}

function Machines() {
  const xs = [-49, -13, 23]
  return (
    <g transform="translate(0 6)">
      <Arrow from={[-21, 0]} to={[-15, 0]} />
      <Arrow from={[15, 0]} to={[21, 0]} />
      {xs.map((x, i) => (
        <g
          key={x}
          className={`zhm-step${i === 1 ? " zhm-still" : ""}`}
          style={{ animationDelay: `${i * 1.2}s` }}
        >
          <Slab x={x} y={-13} w={26} d={26} z={7} t={7} top="var(--top)" />
          <Hi x={x} y={-13} w={26} d={26} z={7} />
        </g>
      ))}
    </g>
  )
}

function Events() {
  return (
    <g transform="translate(6 4)">
      <Arrow from={[-26, 0]} to={[-2, 0]} on />
      <Slab x={0} y={-22} w={46} d={44} z={8} t={8} top="var(--top)" />
      <Hi x={0} y={-22} w={46} d={44} z={8} className="zhm-hit" />
      <g className="zhm-press">
        <Slab
          x={-56}
          y={-12}
          w={24}
          d={24}
          z={12}
          t={9}
          top="var(--top)"
          stroke="var(--l3)"
        />
        <IsoText x={-44} y={0} z={12} anchor="middle" size={8}>
          esc
        </IsoText>
      </g>
    </g>
  )
}

function Anatomy() {
  const x = -28
  const y = -22
  const w = 56
  const d = 44
  return (
    <g transform="translate(0 22)">
      <Guide from={[x + w, y + d, 0]} to={[x + w, y + d, 44]} />
      <Guide from={[x, y + d, 0]} to={[x, y + d, 44]} />
      <Guide from={[x + w, y, 0]} to={[x + w, y, 44]} />
      <Slab x={x} y={y} w={w} d={d} z={0} t={2} top="var(--top)" />
      <g className="zhm-float" style={{ animationDuration: "3.6s" }}>
        <Slab
          x={x + 6}
          y={y + 6}
          w={w - 12}
          d={d - 12}
          z={22}
          t={2}
          top="var(--top)"
          stroke="var(--a)"
          side="var(--aside)"
        />
        <Hi x={x + 6} y={y + 6} w={w - 12} d={d - 12} z={22} className="" />
      </g>
      <Slab
        x={x}
        y={y}
        w={w}
        d={d}
        z={44}
        t={2}
        dashed
        stroke="var(--l3)"
        side="none"
      />
    </g>
  )
}

function Adapters() {
  const sats: [number, number][] = [
    [-44, 0],
    [0, -44],
    [44, 0],
    [0, 44],
  ]
  const Sat = (p: [number, number], i: number) => (
    <g key={i}>
      <Slab
        x={p[0] - 9}
        y={p[1] - 9}
        w={18}
        d={18}
        z={5}
        t={5}
        top="var(--top)"
      />
      <Hi
        x={p[0] - 9}
        y={p[1] - 9}
        w={18}
        d={18}
        z={5}
        className={`zhm-hi zhm-ping${i === 2 ? " zhm-still" : ""}`}
        style={{ animationDelay: `${i * 0.8}s` }}
      />
    </g>
  )
  return (
    <g transform="translate(0 6)">
      {sats.slice(0, 2).map(Sat)}
      <g fill="none" stroke="var(--k)" strokeDasharray="1 3">
        {sats.map((p) => (
          <polyline
            key={`${p[0]},${p[1]}`}
            points={pts([
              [p[0] * 0.38, p[1] * 0.38],
              [p[0] * 0.78, p[1] * 0.78],
            ])}
          />
        ))}
      </g>
      <Slab
        x={-16}
        y={-16}
        w={32}
        d={32}
        z={11}
        t={11}
        top="var(--top)"
        stroke="var(--a)"
        side="var(--aside)"
      />
      <Hi x={-16} y={-16} w={32} d={32} z={11} className="" />
      {sats.slice(2).map((p, i) => Sat(p, i + 2))}
    </g>
  )
}

function A11y() {
  const s = 50
  const o = -s / 2
  const r = 6
  return (
    <g transform="translate(0 16)">
      <Slab x={o} y={o} w={s} d={s} z={0} t={4} top="var(--top)" />
      <Slab x={o} y={o} w={s} d={s} z={13} t={4} top="var(--top)" />
      <Slab
        x={o}
        y={o}
        w={s}
        d={s}
        z={26}
        t={4}
        top="var(--top)"
        stroke="var(--l3)"
      />
      <polygon
        className="zhm-ring"
        points={top(o - r, o - r, s + 2 * r, s + 2 * r, 26)}
        fill="none"
        stroke="var(--a)"
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
    </g>
  )
}

function Styling() {
  const s = 52
  const o = -s / 2
  return (
    <g transform="translate(0 20)">
      <Slab
        x={o}
        y={o}
        w={s}
        d={s}
        z={10}
        t={10}
        dashed
        stroke="var(--l3)"
        side="none"
      />
      <Guide from={[o + s, o + s, 10]} to={[o + s, o + s, 34]} />
      <Guide from={[o, o + s, 10]} to={[o, o + s, 34]} />
      <Guide from={[o + s, o, 10]} to={[o + s, o, 34]} />
      <g className="zhm-float">
        <Slab
          x={o}
          y={o}
          w={s}
          d={s}
          z={42}
          t={8}
          top="var(--top)"
          stroke="var(--l3)"
        />
        <Hi x={o + 8} y={o + 8} w={14} d={14} z={42} className="" />
        <polygon points={top(o + 26, o + 8, 18, 6, 42)} fill="var(--l)" />
        <polygon points={top(o + 26, o + 18, 12, 6, 42)} fill="var(--l)" />
      </g>
    </g>
  )
}

const art: Record<DiagramKey, { label: string; draw: () => ReactNode }> = {
  principles: {
    label: "Three stacked planes, the top one lit",
    draw: Principles,
  },
  machines: {
    label: "Three state slabs in a row, one active at a time",
    draw: Machines,
  },
  events: {
    label: "A keycap pressed, its event arrow lighting a slab",
    draw: Events,
  },
  anatomy: {
    label: "Three exploded layers of a component, the middle part lit",
    draw: Anatomy,
  },
  adapters: {
    label: "A machine slab wired to four adapter slabs",
    draw: Adapters,
  },
  a11y: {
    label: "Stacked layers with a focus ring around the top one",
    draw: A11y,
  },
  styling: {
    label: "A wireframe slab under a solid styled slab",
    draw: Styling,
  },
}

export function HMini(props: { kind: DiagramKey }) {
  const a = art[props.kind]
  return (
    <svg
      className="zhm"
      viewBox="-80 -55 160 110"
      width="100%"
      aria-label={a.label}
    >
      <style>{css}</style>
      {a.draw()}
    </svg>
  )
}
