"use client"

import * as menu from "@zag-js/menu"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { css } from "styled-system/css"
import { accent } from "./shared"

export interface MenuBeat {
  id: number
  from: string
  to: string
  event: string
  highlighted: string | null
  prevHighlighted: string | null
}

type StateName = "idle" | "open" | "closed"

const H = 36
const W = 112

const pills: Record<StateName, { x: number; y: number }> = {
  idle: { x: 16, y: 48 },
  closed: { x: 264, y: 48 },
  open: { x: 264, y: 200 },
}

const chipAt: Record<StateName, { x: number; y: number }> = {
  idle: { x: 16, y: 2 },
  closed: { x: 388, y: 48 },
  open: { x: 388, y: 200 },
}

interface Edge {
  id: string
  from: StateName
  to: StateName
  d: string
  events: string[]
  x: number
  y: number
  anchor: "start" | "middle" | "end"
}

const edges: Edge[] = [
  {
    id: "idle-closed",
    from: "idle",
    to: "closed",
    d: "M128 66 H260",
    events: ["TRIGGER_FOCUS"],
    x: 194,
    y: 58,
    anchor: "middle",
  },
  {
    id: "closed-idle",
    from: "closed",
    to: "idle",
    d: "M280 84 C280 124 104 124 104 88",
    events: ["TRIGGER_BLUR"],
    x: 192,
    y: 128,
    anchor: "middle",
  },
  {
    id: "idle-open",
    from: "idle",
    to: "open",
    d: "M48 84 V206 Q48 226 68 226 H260",
    events: ["TRIGGER_CLICK"],
    x: 156,
    y: 218,
    anchor: "middle",
  },
  {
    id: "closed-open",
    from: "closed",
    to: "open",
    d: "M300 84 V196",
    events: ["ARROW_DOWN", "TRIGGER_CLICK", "ARROW_UP"],
    x: 292,
    y: 166,
    anchor: "end",
  },
  {
    id: "open-closed",
    from: "open",
    to: "closed",
    d: "M340 200 V88",
    events: ["ITEM_CLICK", "CLOSE", "TRIGGER_CLICK"],
    x: 348,
    y: 166,
    anchor: "start",
  },
  {
    id: "open-open",
    from: "open",
    to: "open",
    d: "M306 237 C306 272 346 272 346 240",
    events: ["ARROW_DOWN", "ARROW_UP", "ITEM_POINTERMOVE"],
    x: 300,
    y: 270,
    anchor: "end",
  },
]

const config = menu.machine.states as Record<
  string,
  { on?: Record<string, unknown> } | undefined
>

const accepts = (state: string, event: string) => !!config[state]?.on?.[event]

function edgeFor(beat: MenuBeat | null) {
  if (!beat) return undefined
  return (
    edges.find(
      (e) =>
        e.from === beat.from &&
        e.to === beat.to &&
        e.events.includes(beat.event),
    ) ?? edges.find((e) => e.from === beat.from && e.to === beat.to)
  )
}

const asState = (value: string): StateName =>
  value === "open" || value === "closed" ? value : "idle"

const root = css({
  display: "block",
  w: "full",
  h: "auto",
  overflow: "visible",
  fontFamily: "mono",
  fontSize: { base: "13px", md: "11px" },
  "--hc1-accent": accent,
  "& [data-line]": {
    fill: "none",
    stroke: "border.bold",
    strokeWidth: "1",
    opacity: "0.6",
    transition: "opacity 240ms, stroke 240ms",
  },
  "& [data-edge][data-live] [data-line]": { opacity: "1" },
  "& [data-head]": { fill: "border.bold" },
  "& [data-label]": {
    fill: "text.muted",
    opacity: "0.32",
    transition: "opacity 240ms, fill 240ms",
  },
  "& [data-edge][data-live] [data-label]": { opacity: "1" },
  "& [data-edge] [data-label][data-fired]": {
    fill: "var(--hc1-accent)",
    opacity: "1",
  },
  "& [data-pill] rect": {
    fill: "bg",
    stroke: "border.bold",
    strokeWidth: "1",
    transition: "fill 220ms, stroke 220ms",
  },
  "& [data-pill] text": {
    fill: "text.muted",
    fontSize: { base: "15px", md: "13px" },
    transition: "fill 220ms",
  },
  "& [data-pill][data-active] rect": {
    stroke: "var(--hc1-accent)",
    fill: "color-mix(in srgb, var(--hc1-accent) 12%, var(--colors-bg))",
    transitionDelay: "380ms",
  },
  "& [data-pill][data-active] text": {
    fill: "var(--hc1-accent)",
    transitionDelay: "380ms",
  },
  "& [data-run]": {
    fill: "none",
    stroke: "var(--hc1-accent)",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeDasharray: "1",
    strokeDashoffset: "1",
    animation:
      "hc1-draw 460ms cubic-bezier(0.4, 0, 0.2, 1) forwards, hc1-fade 900ms ease 1500ms forwards",
  },
  "& [data-token]": {
    fill: "var(--hc1-accent)",
    stroke: "bg",
    strokeWidth: "2",
    opacity: "0",
    offsetRotate: "0deg",
    animation: "hc1-token 460ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
  },
  "& [data-chip]": {
    opacity: "0",
    animation: "hc1-in 220ms ease 380ms forwards",
  },
  "& [data-chip] rect": {
    fill: "bg",
    stroke: "border.bold",
    strokeWidth: "1",
  },
  "& [data-chip] [data-key]": { fill: "text.muted", fontSize: "10px" },
  "& [data-chip] [data-value]": {
    fill: "text.bold",
    fontSize: { base: "13px", md: "12px" },
  },
  "& [data-chip] [data-pin]": { stroke: "border.bold", strokeWidth: "1" },
  "@media (prefers-reduced-motion: reduce)": {
    "& *": { transition: "none !important", animation: "none !important" },
    "& [data-run], & [data-token]": { display: "none" },
    "& [data-chip]": { opacity: "1" },
  },
})

const keyframes = `
@keyframes hc1-draw { to { stroke-dashoffset: 0; } }
@keyframes hc1-fade { to { opacity: 0; } }
@keyframes hc1-in { to { opacity: 1; } }
@keyframes hc1-token {
  0% { offset-distance: 0%; opacity: 1; }
  92% { opacity: 1; }
  100% { offset-distance: 100%; opacity: 0; }
}
`

function Chip(props: { state: StateName; highlighted: string | null }) {
  const { state, highlighted } = props
  const pos = chipAt[state]
  const textRef = useRef<SVGGElement>(null)
  const [width, setWidth] = useState(124)
  const value = highlighted == null ? "null" : `"${highlighted}"`

  useLayoutEffect(() => {
    const box = textRef.current?.getBBox()
    if (box) setWidth(Math.ceil(box.width) + 20)
  }, [value])

  const pinX = state === "idle" ? 40 : -12
  const pinY = state === "idle" ? H : H / 2

  return (
    <g data-chip="" transform={`translate(${pos.x} ${pos.y})`}>
      {state === "idle" ? (
        <line data-pin="" x1={pinX} y1={pinY} x2={pinX} y2={pinY + 10} />
      ) : (
        <line data-pin="" x1={pinX} y1={pinY} x2={0} y2={pinY} />
      )}
      <rect width={width} height={H} rx="6" />
      <g ref={textRef}>
        <text data-key="" x="10" y="14">
          highlightedValue
        </text>
        <text data-value="" x="10" y="29">
          {value}
        </text>
      </g>
    </g>
  )
}

export function MenuChart(props: {
  state: string
  highlighted: string | null
  beat: MenuBeat | null
}) {
  const state = asState(props.state)
  const { beat } = props
  const run = edgeFor(beat)
  const [shownEvent, setShownEvent] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!run || !beat || !run.events.includes(beat.event)) return
    setShownEvent((m) =>
      m[run.id] === beat.event ? m : { ...m, [run.id]: beat.event },
    )
  }, [run, beat])

  return (
    <svg viewBox="0 0 540 284" className={root} aria-hidden="true">
      <style>{keyframes}</style>
      <defs>
        <marker
          id="hc1-head"
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path data-head="" d="M1 1 L7 4 L1 7 Z" />
        </marker>
      </defs>

      {edges.map((edge) => {
        const live = edge.from === state
        return (
          <g
            key={edge.id}
            data-edge={edge.id}
            data-live={live ? "" : undefined}
          >
            <path data-line="" d={edge.d} markerEnd="url(#hc1-head)" />
            {(() => {
              const event = shownEvent[edge.id] ?? edge.events[0]
              const fired =
                run?.id === edge.id &&
                beat?.event === event &&
                edge.to === state
              return (
                <text
                  data-label=""
                  data-fired={fired ? "" : undefined}
                  data-accepted={
                    live && accepts(edge.from, event) ? "" : undefined
                  }
                  x={edge.x}
                  y={edge.y}
                  textAnchor={edge.anchor}
                >
                  {event}
                </text>
              )
            })()}
          </g>
        )
      })}

      {run && beat ? (
        <g key={beat.id}>
          <path data-run="" d={run.d} pathLength={1} />
          <circle
            data-token=""
            r="4.5"
            style={{ offsetPath: `path("${run.d}")` }}
          />
        </g>
      ) : null}

      {(Object.keys(pills) as StateName[]).map((name) => {
        const p = pills[name]
        return (
          <g
            key={name}
            data-pill={name}
            data-active={state === name ? "" : undefined}
          >
            <rect x={p.x} y={p.y} width={W} height={H} rx={H / 2} />
            <text x={p.x + W / 2} y={p.y + H / 2 + 4.5} textAnchor="middle">
              {name}
            </text>
          </g>
        )
      })}

      <Chip key={state} state={state} highlighted={props.highlighted} />
    </svg>
  )
}
