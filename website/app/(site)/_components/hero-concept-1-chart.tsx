"use client"

import * as menu from "@zag-js/menu"
import { useEffect, useState, type CSSProperties } from "react"
import { css } from "styled-system/css"
import { duration, ease, rest, swapBlur } from "./motion"
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

export const travel = duration.swap * 2
export const typeStep = 30

export const motionVars = {
  "--hc1-out": ease.out,
  "--hc1-inout": ease.inOut,
  "--hc1-press": `${duration.press}ms`,
  "--hc1-close": `${duration.close}ms`,
  "--hc1-hop": `${duration.hop}ms`,
  "--hc1-open": `${duration.open}ms`,
  "--hc1-swap": `${duration.swap}ms`,
  "--hc1-fade": `${duration.fade}ms`,
  "--hc1-travel": `${travel}ms`,
  "--hc1-linger": `${rest.short}ms`,
  "--hc1-blur": swapBlur,
} as CSSProperties

const H = 36
const W = 112
const chipW = 124

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

const arrive = "var(--hc1-open) var(--hc1-out) var(--hc1-travel)"
const leave = "var(--hc1-fade) var(--hc1-inout)"

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
    transition: `opacity ${leave}`,
  },
  "& [data-edge][data-live] [data-line]": {
    opacity: "1",
    transition: `opacity ${arrive}`,
  },
  "& [data-head]": { fill: "border.bold" },
  "& [data-label]": {
    fill: "text.muted",
    opacity: "0.32",
    transition: `opacity ${leave}, filter ${leave}`,
  },
  "& [data-edge][data-live] [data-label]": {
    opacity: "1",
    transition: `opacity ${arrive}, filter ${arrive}`,
  },
  "& [data-edge] [data-label][data-fired]": {
    opacity: "0",
    filter: "var(--hc1-blur)",
    transition:
      "opacity var(--hc1-swap) var(--hc1-inout), filter var(--hc1-swap) var(--hc1-inout)",
  },
  "& [data-glow]": {
    fill: "var(--hc1-accent)",
    opacity: "0",
    filter: "var(--hc1-blur)",
    transition:
      "opacity var(--hc1-swap) var(--hc1-inout), filter var(--hc1-swap) var(--hc1-inout)",
  },
  "& [data-glow][data-fired]": { opacity: "1", filter: "blur(0px)" },
  "& [data-pill] rect": {
    fill: "bg",
    stroke: "border.bold",
    strokeWidth: "1",
  },
  "& [data-pill] text": {
    fill: "text.muted",
    fontSize: { base: "15px", md: "13px" },
  },
  "& [data-pill] [data-lit]": {
    opacity: "0",
    transition: `opacity ${leave}`,
  },
  "& [data-pill] [data-lit] rect": {
    stroke: "var(--hc1-accent)",
    fill: "color-mix(in srgb, var(--hc1-accent) 12%, var(--colors-bg))",
  },
  "& [data-pill] [data-lit] text": { fill: "var(--hc1-accent)" },
  "& [data-pill][data-active] [data-lit]": {
    opacity: "1",
    transition: `opacity ${arrive}`,
  },
  "& [data-run]": {
    fill: "none",
    stroke: "var(--hc1-accent)",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeDasharray: "1",
    strokeDashoffset: "1",
    animation:
      "hc1-draw var(--hc1-travel) var(--hc1-inout) forwards, hc1-out var(--hc1-fade) var(--hc1-inout) calc(var(--hc1-travel) + var(--hc1-linger)) forwards",
  },
  "& [data-token]": {
    fill: "var(--hc1-accent)",
    stroke: "bg",
    strokeWidth: "2",
    opacity: "0",
    offsetRotate: "0deg",
    animation:
      "hc1-travel var(--hc1-travel) var(--hc1-inout) forwards, hc1-blink var(--hc1-travel) linear forwards",
  },
  "& [data-chip] > g": {
    opacity: "0",
    transform: "var(--hc1-from)",
    transition:
      "opacity var(--hc1-close) var(--hc1-out), transform var(--hc1-close) var(--hc1-out)",
  },
  "& [data-chip][data-active] > g": {
    opacity: "1",
    transform: "translate(0px, 0px)",
    transition: `opacity ${arrive}, transform ${arrive}`,
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
  "& [data-chip] [data-value][data-enter]": {
    animation: "hc1-swap-in var(--hc1-swap) var(--hc1-inout) both",
  },
  "& [data-chip] [data-value][data-exit]": {
    animation: "hc1-swap-out var(--hc1-swap) var(--hc1-inout) forwards",
  },
  "& [data-chip] [data-pin]": { stroke: "border.bold", strokeWidth: "1" },
  "@media (prefers-reduced-motion: reduce)": {
    "--hc1-travel": "0ms",
    "--hc1-blur": "blur(0px)",
    "& [data-token]": { display: "none" },
    "& [data-run]": {
      strokeDashoffset: "0",
      animation:
        "hc1-in var(--hc1-fade) var(--hc1-out) both, hc1-out var(--hc1-fade) var(--hc1-inout) var(--hc1-linger) forwards",
    },
    "& [data-chip] > g": { transform: "none" },
    "& [data-chip][data-active] > g": { transform: "none" },
  },
})

const keyframes = `
@keyframes hc1-draw { to { stroke-dashoffset: 0; } }
@keyframes hc1-in { from { opacity: 0; } }
@keyframes hc1-out { to { opacity: 0; } }
@keyframes hc1-travel { from { offset-distance: 0%; } to { offset-distance: 100%; } }
@keyframes hc1-blink { 0% { opacity: 0; } 8%, 88% { opacity: 1; } 100% { opacity: 0; } }
@keyframes hc1-swap-in { from { opacity: 0; filter: var(--hc1-blur); } }
@keyframes hc1-swap-out { to { opacity: 0; filter: var(--hc1-blur); } }
`

function ChipValue(props: { value: string; active: boolean }) {
  const { value, active } = props
  const [swap, setSwap] = useState({
    current: value,
    previous: null as string | null,
    n: 0,
  })
  if (swap.current !== value) {
    setSwap({
      current: value,
      previous: active ? swap.current : null,
      n: swap.n + 1,
    })
  }
  const animate = swap.n > 0 && swap.previous != null
  return (
    <>
      {animate ? (
        <text key={`out-${swap.n}`} data-value="" data-exit="" x="10" y="29">
          {swap.previous}
        </text>
      ) : null}
      <text
        key={`in-${swap.n}`}
        data-value=""
        data-enter={animate ? "" : undefined}
        x="10"
        y="29"
      >
        {swap.current}
      </text>
    </>
  )
}

function Chip(props: {
  name: StateName
  active: boolean
  highlighted: string | null
}) {
  const { name, active, highlighted } = props
  const pos = chipAt[name]
  const value = highlighted == null ? "null" : `"${highlighted}"`
  const [held, setHeld] = useState(value)
  if (active && held !== value) setHeld(value)

  const idle = name === "idle"
  const pinX = idle ? 40 : -12
  const pinY = idle ? H : H / 2
  const from = idle ? "translate(0px, 4px)" : "translate(-4px, 0px)"

  return (
    <g
      data-chip={name}
      data-active={active ? "" : undefined}
      transform={`translate(${pos.x} ${pos.y})`}
    >
      <g style={{ "--hc1-from": from } as CSSProperties}>
        {idle ? (
          <line data-pin="" x1={pinX} y1={pinY} x2={pinX} y2={pinY + 10} />
        ) : (
          <line data-pin="" x1={pinX} y1={pinY} x2={0} y2={pinY} />
        )}
        <rect width={chipW} height={H} rx="6" />
        <text data-key="" x="10" y="14">
          highlightedValue
        </text>
        <ChipValue value={held} active={active} />
      </g>
    </g>
  )
}

export function MenuChart(props: {
  state: string
  highlighted: string | null
  beat: MenuBeat | null
  className?: string
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
    <svg
      viewBox="0 0 540 284"
      className={props.className ? `${root} ${props.className}` : root}
      aria-hidden="true"
    >
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
        const fired =
          !!beat &&
          run?.id === edge.id &&
          edge.events.includes(beat.event) &&
          edge.to === state
        const event = shownEvent[edge.id] ?? edge.events[0]
        return (
          <g
            key={edge.id}
            data-edge={edge.id}
            data-live={live ? "" : undefined}
          >
            <path data-line="" d={edge.d} markerEnd="url(#hc1-head)" />
            <text
              data-label=""
              data-fired={fired ? "" : undefined}
              data-accepted={live && accepts(edge.from, event) ? "" : undefined}
              x={edge.x}
              y={edge.y}
              textAnchor={edge.anchor}
            >
              {event}
            </text>
            <text
              data-glow=""
              data-fired={fired ? "" : undefined}
              x={edge.x}
              y={edge.y}
              textAnchor={edge.anchor}
            >
              {fired && beat ? beat.event : event}
            </text>
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
        const label = (
          <>
            <rect x={p.x} y={p.y} width={W} height={H} rx={H / 2} />
            <text x={p.x + W / 2} y={p.y + H / 2 + 4.5} textAnchor="middle">
              {name}
            </text>
          </>
        )
        return (
          <g
            key={name}
            data-pill={name}
            data-active={state === name ? "" : undefined}
          >
            {label}
            <g data-lit="">{label}</g>
          </g>
        )
      })}

      {(Object.keys(chipAt) as StateName[]).map((name) => (
        <Chip
          key={name}
          name={name}
          active={state === name}
          highlighted={props.highlighted}
        />
      ))}
    </svg>
  )
}
