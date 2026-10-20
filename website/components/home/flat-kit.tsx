"use client"

import type { CSSProperties, ReactNode, Ref } from "react"
import {
  Handle,
  ease,
  isoVars,
  isoVarsLight,
  ramp,
  useClock,
} from "components/lab/hero-iso-kit"

export { Handle, ease, ramp, useClock }

export type P = [number, number]

export const r2 = (n: number) => Math.round(n * 100) / 100

export const sheetCss = (c: string) => `
.${c} { ${isoVars} --th: rgba(255,255,255,.92); --dim: rgba(17,17,19,.78); display: block; overflow: visible }
html:not(.dark) .${c} { ${isoVarsLight} --th: #ffffff; --dim: rgba(255,255,255,.8) }
.${c} text { fill: var(--t); font-size: 13px; letter-spacing: .02em }
.${c} .b { fill: var(--tb) }
.${c} .a { fill: var(--a) }
.${c} .lg { font-size: 15px }
.${c} .sm { font-size: 11px }
`

const dist = (a: P, b: P) => Math.hypot(b[0] - a[0], b[1] - a[1])

export function cut(list: P[], p: number): P[] {
  const total = list.slice(1).reduce((s, b, i) => s + dist(list[i], b), 0)
  let left = total * Math.min(Math.max(p, 0), 1)
  const out: P[] = [list[0]]
  for (let i = 1; i < list.length; i++) {
    const l = dist(list[i - 1], list[i])
    if (left >= l) {
      out.push(list[i])
      left -= l
      continue
    }
    const k = l ? left / l : 0
    out.push([
      r2(list[i - 1][0] + (list[i][0] - list[i - 1][0]) * k),
      r2(list[i - 1][1] + (list[i][1] - list[i - 1][1]) * k),
    ])
    break
  }
  return out
}

export const tip = (list: P[], p: number) => {
  const c = cut(list, p)
  return c[c.length - 1]
}

export const line = (list: P[]) => list.map((q) => q.join(",")).join(" ")

export const lerp = (a: number, b: number, k: number) => r2(a + (b - a) * k)

export function Rect(props: {
  x: number
  y: number
  w: number
  h: number
  r?: number
  draw?: number
  stroke?: string
  fill?: string
  width?: number
  dash?: string
  className?: string
  style?: CSSProperties
}) {
  const d = props.draw ?? 1
  return (
    <rect
      className={props.className}
      style={props.style}
      x={props.x}
      y={props.y}
      width={props.w}
      height={props.h}
      rx={props.r}
      fill={props.fill ?? "none"}
      stroke={props.stroke ?? "var(--l2)"}
      strokeWidth={props.width ?? 1.1}
      pathLength={d < 1 ? 100 : undefined}
      strokeDasharray={d < 1 ? `${r2(d * 100)} 100` : props.dash}
    />
  )
}

export function Corners(props: {
  x: number
  y: number
  w: number
  h: number
  o?: number
  on?: boolean
  s?: number
}) {
  const { x, y, w, h } = props
  const list: P[] = [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ]
  return (
    <g style={{ opacity: props.o ?? 1 }}>
      {list.map((q) => (
        <Handle key={q.join(",")} at={q} s={props.s ?? 4} on={props.on} />
      ))}
    </g>
  )
}

export function Guide(props: {
  pts: P[]
  p?: number
  stroke?: string
  style?: CSSProperties
}) {
  return (
    <polyline
      points={line(cut(props.pts, props.p ?? 1))}
      fill="none"
      stroke={props.stroke ?? "var(--k)"}
      strokeDasharray="1 3"
      style={props.style}
    />
  )
}

export function Wire(props: {
  pts: P[]
  p?: number
  on?: boolean
  head?: boolean
  dash?: string
  width?: number
  style?: CSSProperties
}) {
  const p = props.p ?? 1
  const stroke = props.on ? "var(--a)" : "var(--l2)"
  const n = props.pts.length
  const a = props.pts[n - 2]
  const b = props.pts[n - 1]
  const l = dist(a, b) || 1
  const dx = (b[0] - a[0]) / l
  const dy = (b[1] - a[1]) / l
  const head: P[] = [
    [r2(b[0] - dx * 7 - dy * 3.5), r2(b[1] - dy * 7 + dx * 3.5)],
    b,
    [r2(b[0] - dx * 7 + dy * 3.5), r2(b[1] - dy * 7 - dx * 3.5)],
  ]
  return (
    <g style={props.style}>
      <polyline
        points={line(cut(props.pts, p))}
        fill="none"
        stroke={stroke}
        strokeWidth={props.width ?? 1.1}
        strokeDasharray={props.dash}
        strokeLinejoin="round"
      />
      {props.head && p >= 0.99 && (
        <polygon points={line(head)} fill={stroke} stroke={stroke} />
      )}
    </g>
  )
}

export function Packet(props: { at: P; o?: number }) {
  return (
    <g style={{ opacity: props.o ?? 1 }}>
      <circle cx={props.at[0]} cy={props.at[1]} r={8} fill="var(--as)" />
      <circle cx={props.at[0]} cy={props.at[1]} r={3.5} fill="var(--a)" />
    </g>
  )
}

export function Keycap(props: {
  x: number
  y: number
  w: number
  h: number
  label: ReactNode
  press?: number
  on?: boolean
  size?: number
  style?: CSSProperties
}) {
  const { x, y, w, h } = props
  const d = r2((props.press ?? 0) * 3)
  const stroke = props.on ? "var(--a)" : "var(--l3)"
  return (
    <g style={props.style}>
      <Rect x={x} y={y} w={w} h={h} r={7} stroke={stroke} />
      <Rect
        x={x + 5}
        y={y + 4 + d}
        w={w - 10}
        h={h - 14}
        r={5}
        stroke={props.on ? "var(--a)" : "var(--l2)"}
        fill={props.on ? "var(--as)" : "none"}
      />
      <text
        x={x + w / 2}
        y={y + 4 + d + (h - 14) / 2}
        textAnchor="middle"
        dominantBaseline="central"
        className={props.on ? "a" : "b"}
        style={{ fontSize: props.size ?? 14 }}
      >
        {props.label}
      </text>
    </g>
  )
}

export function Sheet(props: {
  cls: string
  label: string
  svgRef: Ref<SVGSVGElement>
  children: ReactNode
}) {
  return (
    <svg
      ref={props.svgRef}
      className={props.cls}
      viewBox="0 0 640 440"
      width="100%"
      aria-label={props.label}
    >
      <style>{sheetCss(props.cls)}</style>
      {props.children}
    </svg>
  )
}
