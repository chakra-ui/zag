"use client"

import {
  Guide,
  IsoHandles,
  IsoText,
  Slab,
  isoVars,
  isoVarsLight,
  lift,
  px,
  useStep,
} from "./hero-iso-kit"

const root = { x: 0, y: 0, w: 290, d: 120 }
const control = { x: 24, y: 36, w: 96, d: 48 }
const thumb = { y: 42, w: 40, d: 36, off: 30, on: 74 }
const label = { x: 142, y: 44, w: 124, d: 32 }
const Z = 124
const COL = 276

const script = [
  { up: false, checked: false },
  { up: true, checked: false },
  { up: true, checked: true },
  { up: true, checked: false },
  { up: true, checked: true },
  { up: true, checked: true },
]

const css = `
.zst { ${isoVars} }
html:not(.dark) .zst { ${isoVarsLight} }
.zst text { fill: var(--t); font-size: 12px; letter-spacing: .02em }
.zst .zst-lift { transition: transform 900ms cubic-bezier(.65,0,.35,1), opacity 600ms ease }
.zst .zst-move { transition: transform 360ms cubic-bezier(.65,0,.35,1) }
.zst .zst-fade { transition: opacity 400ms ease, fill 300ms ease, stroke 300ms ease }
@media (prefers-reduced-motion: reduce) { .zst .zst-lift, .zst .zst-move, .zst .zst-fade { transition: none } }
`

function Wire(props: {
  b: { x: number; y: number; w: number; d: number }
  name: string
}) {
  const { b } = props
  return (
    <g>
      <Slab x={b.x} y={b.y} w={b.w} d={b.d} stroke="var(--l3)" dashed />
      <IsoText x={b.x + 6} y={b.y + b.d - 8} size={9}>
        {props.name}
      </IsoText>
    </g>
  )
}

function Callout(props: {
  at: [number, number]
  row: number
  sel: string
  note?: string
  hot?: boolean
  show: boolean
}) {
  const [x, y0] = props.at
  const y = props.row
  return (
    <g className="zst-fade" style={{ opacity: props.show ? 1 : 0 }}>
      <path
        d={`M${x + 5} ${y0} H${COL - 34} L${COL - 8} ${y}`}
        stroke="var(--k)"
        strokeDasharray="1 3"
        fill="none"
      />
      <circle cx={x} cy={y0} r="2.5" fill="var(--l3)" />
      <text x={COL} y={props.note ? y - 3 : y + 4}>
        <tspan style={{ fill: "var(--tb)" }}>{props.sel}</tspan>
      </text>
      {props.note && (
        <text x={COL} y={y + 13}>
          <tspan
            className="zst-fade"
            style={{ fill: props.hot ? "var(--a)" : "var(--t)" }}
          >
            {props.note}
          </tspan>
        </text>
      )}
    </g>
  )
}

export function IsoStyling() {
  const step = useStep(script.length, 1500, 2)
  const { up, checked } = script[step]
  const state = checked ? "checked" : "unchecked"
  const tx = checked ? thumb.on : thumb.off
  const ca = px(control.x + control.w, control.y + control.d, Z + 4)
  const ta = px(tx + thumb.w, thumb.y, Z + 12)
  const la = px(label.x + label.w, label.y, Z)
  const rz = up ? 0 : -Z

  return (
    <svg
      className="zst"
      viewBox="-142 -176 640 440"
      width="100%"
      aria-label="A switch drawn twice: an unstyled wireframe on the floor and a styled copy lifted above it. Callouts name the selectors that style it, data-switch-control, data-switch-thumb and data-switch-label, while data-state flips between checked and unchecked"
    >
      <style>{css}</style>

      <Slab
        x={root.x}
        y={root.y}
        w={root.w}
        d={root.d}
        stroke="var(--l3)"
        dashed
      />
      <IsoHandles {...root} s={4} />
      <Wire b={control} name="control" />
      <g
        className="zst-move"
        style={{ transform: lift(checked ? thumb.on - thumb.off : 0, 0) }}
      >
        <Wire
          b={{ x: thumb.off, y: thumb.y, w: thumb.w, d: thumb.d }}
          name="thumb"
        />
      </g>
      <Wire b={label} name="label" />
      <IsoText x={6} y={root.d - 10} size={10}>
        root · unstyled
      </IsoText>

      {[
        [root.x, root.y],
        [root.x + root.w, root.y],
        [root.x + root.w, root.y + root.d],
        [root.x, root.y + root.d],
      ].map(([x, y]) => (
        <Guide
          key={`${x}${y}`}
          from={[x, y, 0]}
          to={[x, y, Z]}
          className="zst-fade"
          style={{ opacity: up ? 1 : 0 }}
        />
      ))}

      <g
        className="zst-lift"
        style={{ transform: lift(0, 0, rz), opacity: up ? 1 : 0 }}
      >
        <Slab
          x={root.x}
          y={root.y}
          w={root.w}
          d={root.d}
          z={Z}
          t={8}
          top="var(--top)"
          stroke="var(--l2)"
        />
        <Slab
          x={control.x}
          y={control.y}
          w={control.w}
          d={control.d}
          z={Z + 4}
          t={4}
          top={checked ? "var(--as)" : "var(--side)"}
          side={checked ? "var(--aside)" : "var(--side)"}
          stroke={checked ? "var(--a)" : "var(--l2)"}
          className="zst-fade"
        />
        <g
          className="zst-move"
          style={{ transform: lift(checked ? thumb.on - thumb.off : 0, 0) }}
        >
          <Slab
            x={thumb.off}
            y={thumb.y}
            w={thumb.w}
            d={thumb.d}
            z={Z + 12}
            t={8}
            top="var(--top)"
            side="var(--side)"
            stroke={checked ? "var(--a)" : "var(--l3)"}
            className="zst-fade"
          />
        </g>
        <IsoText x={label.x + 4} y={label.y + label.d / 2} z={Z} size={13}>
          <tspan style={{ fill: "var(--tb)" }}>Notifications</tspan>
        </IsoText>
      </g>

      <Callout
        at={ta}
        row={-104}
        sel="[data-switch-thumb]"
        note={`[data-state="${state}"]`}
        hot={checked}
        show={up}
      />
      <Callout
        at={ca}
        row={-44}
        sel="[data-switch-control]"
        note={`[data-state="${state}"]`}
        hot={checked}
        show={up}
      />
      <Callout at={la} row={20} sel="[data-switch-label]" show={up} />

      <g transform="translate(-130 236)">
        <text>
          <tspan style={{ fill: "var(--tb)" }}>
            {up ? "styled" : "unstyled"}
          </tspan>
          <tspan dx={12}>data-state=</tspan>
          <tspan style={{ fill: checked ? "var(--a)" : "var(--tb)" }}>
            "{state}"
          </tspan>
        </text>
      </g>
    </svg>
  )
}
