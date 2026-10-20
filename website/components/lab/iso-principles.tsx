"use client"

import type { CSSProperties } from "react"
import {
  Guide,
  IsoHandles,
  IsoText,
  Slab,
  isoVars,
  isoVarsLight,
  pts,
  px,
  useStep,
} from "./hero-iso-kit"

const W = 170
const D = 110
const X = -W / 2
const Y = -D / 2
const GAP = 122

const planes = [
  { name: "logic", note: "machine", z: 0 },
  { name: "props", note: "connect()", z: GAP },
  { name: "your markup", note: "any element", z: GAP * 2 },
]

const chips = [
  { text: "aria-expanded: true", y: -46, to: 0 },
  { text: 'data-state: "open"', y: -14, to: 1 },
  { text: "onClick: send(…)", y: 18, to: 0 },
]

const markup = [
  { text: "<button>", x: -70, y: -42, w: 92, d: 30 },
  { text: "<div> content", x: -70, y: 0, w: 140, d: 40 },
]

const css = `
.zpr { ${isoVars} }
html:not(.dark) .zpr { ${isoVarsLight} }
.zpr text { fill: var(--t); font-size: 12px; letter-spacing: .02em }
.zpr .zpr-fade { transition: opacity 400ms ease, fill 300ms ease, stroke 300ms ease }
@keyframes zpr-go {
  0% { transform: translate(var(--x0), var(--y0)); opacity: 0 }
  10% { opacity: 1 }
  45% { transform: translate(var(--x1), var(--y1)) }
  55% { transform: translate(var(--x1), var(--y1)) }
  90% { opacity: 1 }
  100% { transform: translate(var(--x2), var(--y2)); opacity: 0 }
}
.zpr .zpr-pk { animation: zpr-go 1500ms cubic-bezier(.65,0,.35,1) 100ms both }
@media (prefers-reduced-motion: reduce) { .zpr .zpr-fade { transition: none } .zpr .zpr-pk { animation: none; opacity: 0 } }
`

const src: [number, number, number] = [42, -24, 8]
const chipAt = (i: number): [number, number, number] => [
  -4,
  chips[i].y + 13,
  GAP + 3,
]
const markAt = (i: number): [number, number, number] => {
  const m = markup[chips[i].to]
  return [m.x + m.w / 2, m.y + m.d / 2, GAP * 2 + 4]
}

export function IsoPrinciples() {
  const step = useStep(chips.length, 1900, 0)
  const [x0, y0] = px(...src)
  const [x1, y1] = px(...chipAt(step))
  const [x2, y2] = px(...markAt(step))
  const hot = chips[step].to

  const layers = [
    <>
      <Slab x={-70} y={-40} w={64} d={32} z={8} t={4} top="var(--top)" />
      <IsoText x={-63} y={-24} z={8} size={11}>
        closed
      </IsoText>
      <Slab
        x={10}
        y={-40}
        w={64}
        d={32}
        z={8}
        t={4}
        top="var(--as)"
        side="var(--aside)"
        stroke="var(--a)"
      />
      <IsoText x={17} y={-24} z={8} size={11}>
        <tspan style={{ fill: "var(--a)" }}>open</tspan>
      </IsoText>
      <g stroke="var(--l3)" fill="none">
        <polyline
          points={pts([
            [-4, -24, 4],
            [8, -24, 4],
          ])}
        />
        <polyline
          points={pts([
            [3, -28, 4],
            [8, -24, 4],
            [3, -20, 4],
          ])}
        />
      </g>
      <Slab
        x={-70}
        y={6}
        w={144}
        d={30}
        z={6}
        t={2}
        stroke="var(--l2)"
        dashed
      />
      <IsoText x={-62} y={21} z={6} size={11}>
        context · value
      </IsoText>
    </>,
    <>
      {chips.map((c, i) => {
        const on = i === step
        return (
          <g key={c.text}>
            <Slab
              x={-72}
              y={c.y}
              w={146}
              d={26}
              z={GAP + 7}
              t={3}
              top="var(--top)"
              side={on ? "var(--aside)" : "var(--side)"}
              stroke={on ? "var(--a)" : "var(--l2)"}
              className="zpr-fade"
            />
            <IsoText x={-64} y={c.y + 13} z={GAP + 7} size={11}>
              <tspan
                className="zpr-fade"
                style={{ fill: on ? "var(--a)" : "var(--tb)" }}
              >
                {c.text}
              </tspan>
            </IsoText>
          </g>
        )
      })}
    </>,
    <>
      {markup.map((m, i) => {
        const on = i === hot
        return (
          <g key={m.text}>
            <Slab
              x={m.x}
              y={m.y}
              w={m.w}
              d={m.d}
              z={GAP * 2 + 8}
              t={4}
              top="var(--top)"
              side={on ? "var(--aside)" : "var(--side)"}
              stroke={on ? "var(--a)" : "var(--l2)"}
              className="zpr-fade"
            />
            <IsoText x={m.x + 10} y={m.y + m.d / 2} z={GAP * 2 + 8} size={12}>
              <tspan
                className="zpr-fade"
                style={{ fill: on ? "var(--a)" : "var(--tb)" }}
              >
                {m.text}
              </tspan>
            </IsoText>
          </g>
        )
      })}
    </>,
  ]

  return (
    <svg
      className="zpr"
      viewBox="-340 -334 640 440"
      width="100%"
      aria-label="Three stacked planes: logic at the bottom, props in the middle and your markup on top. A machine in the logic plane produces props such as aria-expanded and data-state, and each one is spread onto an element in your markup"
    >
      <style>{css}</style>

      {[
        [X, Y],
        [X + W, Y],
        [X + W, Y + D],
        [X, Y + D],
      ].map(([x, y]) => (
        <Guide key={`${x}${y}`} from={[x, y, 0]} to={[x, y, GAP * 2]} />
      ))}

      {planes.map((p, i) => {
        const [lx, ly] = px(X, Y + D, p.z)
        const [rx, ry] = px(X + W, Y, p.z)
        return (
          <g key={p.name}>
            <Slab
              x={X}
              y={Y}
              w={W}
              d={D}
              z={p.z}
              t={4}
              top="var(--top)"
              stroke="var(--l2)"
            />
            <IsoHandles x={X} y={Y} w={W} d={D} z={p.z} s={4} />
            {layers[i]}
            <path
              d={`M${lx - 6} ${ly} H-296`}
              stroke="var(--k)"
              strokeDasharray="1 3"
              fill="none"
            />
            <text x={-296} y={ly - 6}>
              <tspan style={{ fill: "var(--tb)", fontSize: 14 }}>
                {p.name}
              </tspan>
            </text>
            <text x={-296} y={ly + 14} style={{ fontSize: 11 }}>
              0{i} · {p.note}
            </text>
            {i > 0 && (
              <g stroke="var(--k)" fill="none">
                <polyline points={`${rx + 26},${ry} ${rx + 26},${ry + GAP}`} />
                <polyline points={`${rx + 22},${ry} ${rx + 30},${ry}`} />
                <polyline
                  points={`${rx + 22},${ry + GAP} ${rx + 30},${ry + GAP}`}
                />
                <polyline
                  points={`${rx + 6},${ry} ${rx + 22},${ry}`}
                  strokeDasharray="1 3"
                />
                {i === 1 && (
                  <polyline
                    points={`${rx + 6},${ry + GAP} ${rx + 22},${ry + GAP}`}
                    strokeDasharray="1 3"
                  />
                )}
              </g>
            )}
            {i > 0 && (
              <text x={rx + 34} y={ry + GAP / 2 + 4} style={{ fontSize: 11 }}>
                {i === 1 ? "connect()" : "spread"}
              </text>
            )}
          </g>
        )
      })}

      <g
        key={step}
        className="zpr-pk"
        style={
          {
            "--x0": `${x0}px`,
            "--y0": `${y0}px`,
            "--x1": `${x1}px`,
            "--y1": `${y1}px`,
            "--x2": `${x2}px`,
            "--y2": `${y2}px`,
          } as CSSProperties
        }
      >
        <circle r="8" fill="var(--ag)" opacity={0.6} />
        <circle r="3.5" fill="var(--a)" />
      </g>
    </svg>
  )
}
