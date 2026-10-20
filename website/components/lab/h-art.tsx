"use client"

import { useId } from "react"
import {
  Glow,
  Handle,
  IsoText,
  Slab,
  ease,
  isoVars,
  isoVarsLight,
  pts,
  ramp,
  useClock,
} from "./hero-iso-kit"

export { HMini } from "./h-iso-mini"

type V = [number, number]

const P: V[] = [
  [243.68, 67.79],
  [310.68, 13.03],
  [265.18, 112],
  [369.68, 7],
]
const W = 9.5
const K = 2.1
const Q = 0.72
const CX = 306.5
const CY = 59.5
const H = 22
const L = 330
const PT = 16

const RISE0 = 500
const RISE_GAP = 650
const RISE = 560
const T0 = RISE0 + 2 * RISE_GAP + RISE + 500
const RUN = 2400
const LOOP = 3400

const names = ["idle", "open", "closed"]

const r2 = (n: number) => Math.round(n * 100) / 100
const add = (a: V, b: V, k = 1): V => [a[0] + b[0] * k, a[1] + b[1] * k]
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1]]
const norm = (a: V): V => {
  const l = Math.hypot(a[0], a[1])
  return [a[0] / l, a[1] / l]
}
const cross = (a: V, b: V) => a[0] * b[1] - a[1] * b[0]

const dirs = [0, 1, 2].map((i) => norm(sub(P[i + 1], P[i])))
const nrms = dirs.map((d): V => [-d[1], d[0]])

function joint(j: number) {
  const d1 = dirs[j - 1]
  const d2 = dirs[j]
  const n1 = nrms[j - 1]
  const n2 = nrms[j]
  const at = (s: number) => {
    const a = add(P[j], n1, s * W)
    const b = add(P[j], n2, s * W)
    const t = cross(sub(b, a), d2) / cross(d1, d2)
    return { t, p: add(a, d1, t) }
  }
  const plus = at(1)
  const inner = plus.t < 0 ? 1 : -1
  const I = inner === 1 ? plus.p : at(-1).p
  const o = -inner
  const O1 = add(P[j], n1, o * W)
  const O2 = add(P[j], n2, o * W)
  const M: V = [(O1[0] + O2[0]) / 2, (O1[1] + O2[1]) / 2]
  return { inner, I, M, O1, O2 }
}

const joints = [null, joint(1), joint(2)]

function cap(i: number, end: boolean): V[] {
  const v = end ? i + 1 : i
  if (v === 0 || v === 3) {
    return [add(P[v], nrms[i], W), add(P[v], nrms[i], -W)]
  }
  const j = joints[v]!
  const O = end ? j.O1 : j.O2
  return j.inner === 1 ? [j.I, j.M, O] : [O, j.M, j.I]
}

const scr = (p: V): V => [r2((p[0] - CX) * K), r2((p[1] - CY) * K * Q)]

function inside(pt: V, poly: V[]) {
  let c = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (
      yi > pt[1] !== yj > pt[1] &&
      pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi
    )
      c = !c
  }
  return c
}

const pieces = [0, 1, 2].map((i) => {
  const start = cap(i, false)
  const end = cap(i, true).reverse()
  const raw = [...start, ...end]
  const poly = raw.map(scr)
  const cuts = new Set<number>()
  raw.forEach((p, k) => {
    const q = raw[(k + 1) % raw.length]
    for (const j of [joints[1], joints[2]]) {
      if (!j) continue
      const hit = (a: V, b: V) => a[0] === b[0] && a[1] === b[1]
      if ((hit(p, j.I) && hit(q, j.M)) || (hit(p, j.M) && hit(q, j.I)))
        cuts.add(k)
    }
  })
  const faces = poly
    .map((p, k) => {
      const q = poly[(k + 1) % poly.length]
      const e = sub(q, p)
      let n: V = norm([e[1], -e[0]])
      const mid: V = [
        (p[0] + q[0]) / 2 + n[0] * 0.5,
        (p[1] + q[1]) / 2 + n[1] * 0.5,
      ]
      if (inside(mid, poly)) n = [-n[0], -n[1]]
      return { p, q, n, cut: cuts.has(k) }
    })
    .filter((f) => f.n[1] > 0.01 && !f.cut)
  return { poly, faces }
})

const lens = [0, 1, 2].map((i) => Math.hypot(...sub(P[i + 1], P[i])))
const total = lens.reduce((a, b) => a + b, 0)

function along(u: number) {
  let s = u * total
  for (let i = 0; i < 3; i++) {
    if (s <= lens[i] || i === 2) {
      const k = Math.min(s / lens[i], 1)
      return { i, at: scr(add(P[i], sub(P[i + 1], P[i]), k)) }
    }
    s -= lens[i]
  }
  return { i: 2, at: scr(P[3]) }
}

const labels: { at: V; anchor: "start" | "end" }[] = [
  { at: [252, 30], anchor: "end" },
  { at: [240, 100], anchor: "end" },
  { at: [338, 92], anchor: "start" },
]

const back = (r: number) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(r - 1, 3) + c1 * Math.pow(r - 1, 2)
}

const f = (pt: V, z = 0) => `${r2(pt[0])},${r2(pt[1] - z)}`
const poly = (list: V[], z = 0) => list.map((p) => f(p, z)).join(" ")

const css = `
.zhl { ${isoVars}
  --mt: #48bb78; --mt2: #68c993; --ml: #2b7a4f; --mr: #1d5638; --me: rgba(0,0,0,.35);
}
html:not(.dark) .zhl { ${isoVarsLight}
  --mt: #2f855a; --mt2: #3fa06f; --ml: #236b47; --mr: #1a5236; --me: rgba(0,0,0,.2);
}
.zhl text { fill: var(--t); font-size: 12px; letter-spacing: .02em }
`

export function HLogo() {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "")
  const [t, ref] = useClock<SVGSVGElement>(T0 + RUN / 2)

  const rise = [0, 1, 2].map((i) => back(ramp(t, RISE0 + i * RISE_GAP, RISE)))
  const shown = [0, 1, 2].map((i) => ramp(t, RISE0 + i * RISE_GAP, 160))
  const built = ramp(t, T0 - 400, 400)

  const local = t >= T0 ? (t - T0) % LOOP : -1
  const u = local >= 0 ? ease(ramp(local, 0, RUN)) : 0
  const tokenOn =
    local < 0
      ? 0
      : Math.min(ramp(local, 0, 160), 1 - ramp(local, RUN + 300, 300))
  const tok = along(u)
  const active = tokenOn > 0.5 ? tok.i : -1

  const half = L / 2
  const grid: string[] = []
  for (let v = -half + 30; v < half; v += 30) {
    grid.push(
      pts([
        [v, -half],
        [v, half],
      ]),
    )
    grid.push(
      pts([
        [-half, v],
        [half, v],
      ]),
    )
  }

  const ext: V = scr(add(P[3], dirs[2], 26))
  const tip = scr(P[3])

  return (
    <svg
      ref={ref}
      className="zhl"
      viewBox="-310 -190 620 400"
      width="100%"
      aria-label="The Zag mark extruded in isometric on a grid plate. Its three strokes rise one by one, labelled idle, open and closed, then a token runs along the top of the mark from state to state"
    >
      <style>{css}</style>
      <defs>
        <Glow id={`${uid}g`} blur={4} />
        <Glow id={`${uid}G`} blur={14} />
      </defs>

      <Slab
        x={-half}
        y={-half}
        w={L}
        d={L}
        z={0}
        t={PT}
        top="var(--top)"
        stroke="var(--l2)"
      />
      <g stroke="var(--grid)" fill="none">
        {grid.map((g) => (
          <polyline key={g} points={g} />
        ))}
      </g>
      <IsoText x={-half + 14} y={half - 14} size={11}>
        zag · 3 states
      </IsoText>

      <g fill="none" stroke="var(--k)" strokeDasharray="3 4">
        {pieces.map((pc, i) => (
          <polygon
            key={i}
            points={poly(pc.poly)}
            style={{ opacity: 1 - shown[i] * 0.6 }}
          />
        ))}
      </g>

      <g
        fill="var(--ag)"
        filter={`url(#${uid}G)`}
        style={{ opacity: built * 0.35 }}
      >
        {pieces.map((pc, i) => (
          <polygon key={i} points={poly(pc.poly)} />
        ))}
      </g>

      <polyline
        points={`${f(tip, H)} ${f(ext, H)}`}
        stroke="var(--k)"
        strokeDasharray="1 3"
        fill="none"
        style={{ opacity: built }}
      />

      {pieces.map((pc, i) => {
        const z = rise[i] * H
        if (shown[i] === 0) return null
        const lit = active === i
        return (
          <g key={i} style={{ opacity: shown[i] }} strokeLinejoin="round">
            {pc.faces.map((fc, k) => (
              <polygon
                key={k}
                points={`${f(fc.p)} ${f(fc.q)} ${f(fc.q, z)} ${f(fc.p, z)}`}
                fill={fc.n[0] > 0 ? "var(--mr)" : "var(--ml)"}
                stroke="var(--me)"
                strokeWidth={0.75}
              />
            ))}
            <polygon
              points={poly(pc.poly, z)}
              fill={lit ? "var(--mt2)" : "var(--mt)"}
              stroke="var(--me)"
              strokeWidth={0.75}
              style={{ transition: "fill 240ms ease" }}
            />
          </g>
        )
      })}

      {labels.map((lb, i) => {
        const [x, y] = scr(lb.at)
        const lit = active === i
        return (
          <g key={names[i]} style={{ opacity: shown[i] }}>
            <text
              transform={`translate(${x} ${y}) scale(1 ${Q})`}
              textAnchor={lb.anchor}
              dominantBaseline="middle"
              style={{
                fontSize: 15,
                fill: lit ? "var(--tb)" : "var(--t)",
                transition: "fill 240ms ease",
              }}
            >
              {names[i]}
            </text>
          </g>
        )
      })}

      <g style={{ opacity: built }}>
        {P.map((p) => (
          <Handle key={p[0]} at={[scr(p)[0], r2(scr(p)[1] - H)]} s={5} />
        ))}
      </g>

      <g
        transform={`translate(${r2(tok.at[0])} ${r2(tok.at[1] - H)})`}
        style={{ opacity: tokenOn }}
      >
        <ellipse rx="14" ry="8" fill="var(--ag)" filter={`url(#${uid}g)`} />
        <ellipse
          rx="5.5"
          ry="3.2"
          fill="var(--hf)"
          stroke="var(--tb)"
          strokeWidth={1.25}
        />
      </g>
    </svg>
  )
}
