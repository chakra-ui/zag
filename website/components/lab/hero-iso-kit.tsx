"use client"

import { useEffect, useState, type ReactNode } from "react"

export const C = 0.866

export const px = (x: number, y: number, z = 0): [number, number] => [
  (x - y) * C,
  (x + y) * 0.5 - z,
]

export const pts = (list: [number, number, number?][]) =>
  list
    .map(([x, y, z]) =>
      px(x, y, z)
        .map((n) => n.toFixed(2))
        .join(","),
    )
    .join(" ")

export const lift = (dx: number, dy: number, dz = 0) => {
  const [sx, sy] = px(dx, dy, dz)
  return `translate(${sx.toFixed(2)}px, ${sy.toFixed(2)}px)`
}

export function useStep(count: number, ms: number, still: number) {
  const [step, setStep] = useState(still)
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    setStep(0)
    const id = setInterval(() => setStep((s) => (s + 1) % count), ms)
    return () => clearInterval(id)
  }, [count, ms])
  return step
}

export const isoVars = `
  --l: rgba(255,255,255,.14); --l2: rgba(255,255,255,.3); --l3: rgba(255,255,255,.5);
  --t: rgba(255,255,255,.45); --tb: rgba(255,255,255,.88);
  --top: #18181b; --side: #0f0f11; --grid: rgba(255,255,255,.06);
  --a: #48bb78; --as: rgba(72,187,120,.14); --ag: rgba(72,187,120,.55); --aside: #1f5f3c;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
`

export const isoVarsLight = `
  --l: rgba(0,0,0,.12); --l2: rgba(0,0,0,.26); --l3: rgba(0,0,0,.45);
  --t: rgba(0,0,0,.45); --tb: rgba(0,0,0,.82);
  --top: #ffffff; --side: #ededf0; --grid: rgba(0,0,0,.06);
  --a: #2f855a; --as: rgba(47,133,90,.12); --ag: rgba(47,133,90,.35); --aside: #9fd8b8;
`

export function Slab(props: {
  x: number
  y: number
  w: number
  d: number
  z?: number
  t?: number
  top?: string
  side?: string
  sideR?: string
  stroke?: string
  dashed?: boolean
  className?: string
  width?: number
}) {
  const { x, y, w, d, z = 0, t = 0 } = props
  const b = z - t
  const stroke = props.stroke ?? "var(--l2)"
  return (
    <g
      className={props.className}
      stroke={stroke}
      strokeWidth={props.width ?? 1}
      strokeLinejoin="round"
      strokeDasharray={props.dashed ? "3 4" : undefined}
    >
      {t > 0 && (
        <>
          <polygon
            points={pts([
              [x, y + d, z],
              [x + w, y + d, z],
              [x + w, y + d, b],
              [x, y + d, b],
            ])}
            fill={props.side ?? "var(--side)"}
          />
          <polygon
            points={pts([
              [x + w, y, z],
              [x + w, y + d, z],
              [x + w, y + d, b],
              [x + w, y, b],
            ])}
            fill={props.sideR ?? props.side ?? "var(--side)"}
          />
        </>
      )}
      <polygon
        points={pts([
          [x, y, z],
          [x + w, y, z],
          [x + w, y + d, z],
          [x, y + d, z],
        ])}
        fill={props.top ?? "none"}
      />
    </g>
  )
}

export function IsoText(props: {
  x: number
  y: number
  z?: number
  axis?: "x" | "y"
  size?: number
  anchor?: "start" | "middle" | "end"
  className?: string
  children: ReactNode
}) {
  const [sx, sy] = px(props.x, props.y, props.z)
  const m =
    props.axis === "y"
      ? `matrix(${C},-0.5,${C},0.5,${sx},${sy})`
      : `matrix(${C},0.5,${-C},0.5,${sx},${sy})`
  return (
    <text
      transform={m}
      textAnchor={props.anchor}
      className={props.className}
      style={{ fontSize: props.size ?? 10 }}
      dominantBaseline="middle"
    >
      {props.children}
    </text>
  )
}

export function Glow(props: { id: string; blur?: number }) {
  return (
    <filter id={props.id} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation={props.blur ?? 6} />
    </filter>
  )
}

export function IsoGrid(props: {
  from: number
  to: number
  step: number
  maskId: string
  cx?: number
  cy?: number
}) {
  const lines: ReactNode[] = []
  for (let v = props.from; v <= props.to; v += props.step) {
    lines.push(
      <polyline
        key={`x${v}`}
        points={pts([
          [v, props.from],
          [v, props.to],
        ])}
      />,
    )
    lines.push(
      <polyline
        key={`y${v}`}
        points={pts([
          [props.from, v],
          [props.to, v],
        ])}
      />,
    )
  }
  return (
    <g stroke="var(--grid)" fill="none" mask={`url(#${props.maskId})`}>
      {lines}
    </g>
  )
}
