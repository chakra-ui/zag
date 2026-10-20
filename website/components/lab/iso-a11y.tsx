"use client"

import {
  Glow,
  Guide,
  IsoHandles,
  IsoText,
  Slab,
  isoVars,
  isoVarsLight,
  lift,
  pts,
  useStep,
} from "./hero-iso-kit"

type Box = { x: number; y: number; w: number; d: number; label: string }

const page = { x: 0, y: 0, w: 300, d: 220 }
const pop = { x: 24, y: 72, w: 160, d: 118, z: 84 }
const dlg = { x: 104, y: 36, w: 184, d: 150, z: 168 }

const targets: Record<string, Box> = {
  g0: { x: 24, y: 24, w: 96, d: 34, label: "Menu" },
  p0: { x: 38, y: 126, w: 132, d: 28, label: "Settings…" },
  d0: { x: 118, y: 132, w: 74, d: 32, label: "Cancel" },
  d1: { x: 202, y: 132, w: 72, d: 32, label: "Delete" },
  d2: { x: 248, y: 50, w: 26, d: 24, label: "×" },
}

const script = [
  { key: 0, layers: 3, focus: "d1" },
  { key: 0, layers: 3, focus: "d2" },
  { key: 0, layers: 3, focus: "d0" },
  { key: 1, layers: 2, focus: "p0" },
  { key: 1, layers: 1, focus: "g0" },
  { key: 2, layers: 2, focus: "p0" },
  { key: 2, layers: 3, focus: "d0" },
]

const keys = [
  { glyph: "tab", x: -170, y: 150 },
  { glyph: "esc", x: -118, y: 150 },
  { glyph: "↵", x: -66, y: 150 },
]
const KW = 44

const names = ["page", "popover", "dialog"]

const css = `
.zay { ${isoVars} }
html:not(.dark) .zay { ${isoVarsLight} }
.zay text { fill: var(--t); font-size: 12px; letter-spacing: .02em }
.zay .zay-move { transition: transform 700ms cubic-bezier(.65,0,.35,1), opacity 500ms ease }
.zay .zay-ring { transition: opacity 240ms ease }
.zay .zay-fade { transition: opacity 400ms ease, fill 300ms ease, stroke 300ms ease }
.zay .zay-key { transition: transform 140ms cubic-bezier(.3,0,.2,1) }
@media (prefers-reduced-motion: reduce) { .zay .zay-move, .zay .zay-ring, .zay .zay-fade, .zay .zay-key { transition: none } }
`

function Button(props: { id: string; z: number; focus: string }) {
  const b = targets[props.id]
  const on = props.focus === props.id
  return (
    <g>
      <Slab
        x={b.x}
        y={b.y}
        w={b.w}
        d={b.d}
        z={props.z + 4}
        t={4}
        top="var(--top)"
        side={on ? "var(--aside)" : "var(--side)"}
        stroke={on ? "var(--a)" : "var(--l2)"}
        className="zay-fade"
      />
      <polygon
        className="zay-ring"
        points={pts([
          [b.x - 5, b.y - 5, props.z + 4],
          [b.x + b.w + 5, b.y - 5, props.z + 4],
          [b.x + b.w + 5, b.y + b.d + 5, props.z + 4],
          [b.x - 5, b.y + b.d + 5, props.z + 4],
        ])}
        fill="none"
        stroke="var(--a)"
        strokeWidth={1.5}
        style={{ opacity: on ? 1 : 0 }}
      />
      <IsoText
        x={b.x + (b.w < 40 ? b.w / 2 : 12)}
        y={b.y + b.d / 2}
        z={props.z + 4}
        anchor={b.w < 40 ? "middle" : "start"}
        size={12}
      >
        <tspan
          className="zay-fade"
          style={{ fill: on ? "var(--a)" : "var(--tb)" }}
        >
          {b.label}
        </tspan>
      </IsoText>
    </g>
  )
}

export function IsoA11y() {
  const step = useStep(script.length, 1500, 0)
  const s = script[step]
  const popOpen = s.layers >= 2
  const dlgOpen = s.layers >= 3
  const top = names[s.layers - 1]

  return (
    <svg
      className="zay"
      viewBox="-336 -134 640 440"
      width="100%"
      aria-label="A layer stack: a dialog over a popover over the page. Tab moves a focus ring around the dialog's buttons and wraps inside the focus trap. Escape dismisses only the top layer and focus returns to the layer below"
    >
      <style>{css}</style>
      <defs>
        <Glow id="zay-glow" blur={8} />
      </defs>

      <g>
        {keys.map((k, i) => {
          const down = s.key === i
          return (
            <g
              key={k.glyph}
              className="zay-key"
              style={{ transform: lift(0, 0, down ? -6 : 0) }}
            >
              <Slab
                x={k.x}
                y={k.y}
                w={KW}
                d={KW}
                z={14}
                t={14}
                top="var(--top)"
                side={down ? "var(--aside)" : "var(--side)"}
                stroke={down ? "var(--a)" : "var(--l2)"}
                className="zay-fade"
              />
              <IsoText
                x={k.x + KW / 2}
                y={k.y + KW / 2}
                z={14}
                anchor="middle"
                size={k.glyph.length > 1 ? 13 : 20}
              >
                <tspan style={{ fill: down ? "var(--a)" : "var(--tb)" }}>
                  {k.glyph}
                </tspan>
              </IsoText>
            </g>
          )
        })}
      </g>

      <Slab
        x={page.x}
        y={page.y}
        w={page.w}
        d={page.d}
        z={6}
        t={6}
        top="var(--top)"
        stroke="var(--l2)"
      />
      <g stroke="var(--l)" fill="none">
        {[80, 100, 120, 160, 180].map((y) => (
          <polyline
            key={y}
            points={pts([
              [24, y, 6],
              [y % 40 ? 200 : 260, y, 6],
            ])}
          />
        ))}
      </g>
      <IsoText x={14} y={page.d - 14} z={6} size={12}>
        <tspan style={{ fill: "var(--tb)" }}>page</tspan>
      </IsoText>
      <IsoText x={62} y={page.d - 14} z={6} size={10}>
        <tspan className="zay-fade" style={{ opacity: dlgOpen ? 1 : 0 }}>
          aria-hidden
        </tspan>
      </IsoText>
      <Button id="g0" z={6} focus={s.focus} />

      {[
        [pop.x, pop.y],
        [pop.x + pop.w, pop.y + pop.d],
        [pop.x, pop.y + pop.d],
      ].map(([x, y]) => (
        <Guide
          key={`${x}${y}`}
          from={[x, y, 6]}
          to={[x, y, pop.z]}
          className="zay-fade"
          style={{ opacity: popOpen ? 1 : 0 }}
        />
      ))}

      <g
        className="zay-move"
        style={{
          transform: lift(0, 0, popOpen ? 0 : -pop.z + 6),
          opacity: popOpen ? 1 : 0,
        }}
      >
        <polygon
          points={pts([
            [pop.x, pop.y, pop.z - 30],
            [pop.x + pop.w, pop.y, pop.z - 30],
            [pop.x + pop.w, pop.y + pop.d, pop.z - 30],
            [pop.x, pop.y + pop.d, pop.z - 30],
          ])}
          fill="var(--l)"
          filter="url(#zay-glow)"
          opacity={0.6}
        />
        <Slab
          x={pop.x}
          y={pop.y}
          w={pop.w}
          d={pop.d}
          z={pop.z}
          t={5}
          top="var(--top)"
          stroke="var(--l3)"
        />
        <IsoText x={pop.x + 14} y={pop.y + 24} z={pop.z} size={11}>
          Profile
        </IsoText>
        <IsoText x={pop.x + 14} y={pop.y + pop.d - 12} z={pop.z} size={12}>
          <tspan style={{ fill: "var(--tb)" }}>popover</tspan>
        </IsoText>
        <IsoText x={pop.x + 82} y={pop.y + pop.d - 12} z={pop.z} size={10}>
          <tspan className="zay-fade" style={{ opacity: dlgOpen ? 1 : 0 }}>
            aria-hidden
          </tspan>
        </IsoText>
        <Button id="p0" z={pop.z} focus={s.focus} />
      </g>

      {[
        [dlg.x, dlg.y],
        [dlg.x + dlg.w, dlg.y],
        [dlg.x + dlg.w, dlg.y + dlg.d],
        [dlg.x, dlg.y + dlg.d],
      ].map(([x, y]) => (
        <Guide
          key={`${x}${y}`}
          from={[x, y, 6]}
          to={[x, y, dlg.z]}
          className="zay-fade"
          style={{ opacity: dlgOpen ? 0.8 : 0 }}
        />
      ))}

      <g
        className="zay-move"
        style={{
          transform: lift(0, 0, dlgOpen ? 0 : 60),
          opacity: dlgOpen ? 1 : 0,
        }}
      >
        <polygon
          points={pts([
            [dlg.x, dlg.y, dlg.z - 40],
            [dlg.x + dlg.w, dlg.y, dlg.z - 40],
            [dlg.x + dlg.w, dlg.y + dlg.d, dlg.z - 40],
            [dlg.x, dlg.y + dlg.d, dlg.z - 40],
          ])}
          fill="var(--l)"
          filter="url(#zay-glow)"
          opacity={0.6}
        />
        <Slab
          x={dlg.x}
          y={dlg.y}
          w={dlg.w}
          d={dlg.d}
          z={dlg.z}
          t={6}
          top="var(--top)"
          stroke="var(--l3)"
        />
        <Slab
          x={dlg.x - 12}
          y={dlg.y - 12}
          w={dlg.w + 24}
          d={dlg.d + 24}
          z={dlg.z}
          stroke="var(--a)"
          dashed
        />
        <IsoHandles
          x={dlg.x - 12}
          y={dlg.y - 12}
          w={dlg.w + 24}
          d={dlg.d + 24}
          z={dlg.z}
          s={5}
          on
        />
        <IsoText x={dlg.x - 6} y={dlg.y - 22} z={dlg.z} size={11}>
          <tspan style={{ fill: "var(--a)" }}>focus trap</tspan>
        </IsoText>
        <IsoText x={dlg.x + 14} y={dlg.y + 26} z={dlg.z} size={13}>
          <tspan style={{ fill: "var(--tb)" }}>Delete project?</tspan>
        </IsoText>
        <IsoText x={dlg.x + 14} y={dlg.y + 50} z={dlg.z} size={10}>
          role="dialog" aria-modal
        </IsoText>
        <Button id="d0" z={dlg.z} focus={s.focus} />
        <Button id="d1" z={dlg.z} focus={s.focus} />
        <Button id="d2" z={dlg.z} focus={s.focus} />
      </g>

      <g transform="translate(-326 244)">
        <text>
          layers
          {names.map((n, i) => (
            <tspan
              key={n}
              dx={i === 0 ? 12 : 4}
              style={{
                fill:
                  i === s.layers - 1
                    ? "var(--a)"
                    : i < s.layers
                      ? "var(--tb)"
                      : "var(--l2)",
              }}
            >
              {i > 0 ? `› ${n}` : n}
            </tspan>
          ))}
        </text>
        <text y={20}>
          focus
          <tspan dx={18} style={{ fill: "var(--a)" }}>
            "{targets[s.focus].label}"
          </tspan>
        </text>
        <text y={40}>
          esc
          <tspan dx={34} style={{ fill: "var(--tb)" }}>
            {s.layers > 1 ? `dismiss ${top}` : "nothing to dismiss"}
          </tspan>
        </text>
      </g>
    </svg>
  )
}
