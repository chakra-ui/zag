"use client"

import { useEffect, useState } from "react"
import { Box, HStack, styled } from "styled-system/jsx"

const TICK = 1400
const W = 140
const H = 52

const nodes = [
  { id: "closed", x: 40, y: 60 },
  { id: "opening", x: 380, y: 60 },
  { id: "open", x: 380, y: 300 },
  { id: "closing", x: 40, y: 300 },
]

const edges = [
  {
    id: "open-evt",
    d: "M180 86 H376",
    label: "OPEN",
    lx: 278,
    ly: 76,
    anchor: "middle",
  },
  {
    id: "anim-in",
    d: "M450 112 V296",
    label: "ANIMATION_END",
    lx: 438,
    ly: 210,
    anchor: "end",
  },
  {
    id: "close",
    d: "M380 316 H184",
    label: "CLOSE",
    lx: 282,
    ly: 306,
    anchor: "middle",
  },
  {
    id: "escape",
    d: "M380 338 H184",
    label: "ESCAPE",
    lx: 282,
    ly: 356,
    anchor: "middle",
  },
  {
    id: "anim-out",
    d: "M110 300 V116",
    label: "ANIMATION_END",
    lx: 122,
    ly: 210,
    anchor: "start",
  },
]

const steps = [
  { node: 0, edge: 0 },
  { node: 1, edge: 1 },
  { node: 2, edge: 2 },
  { node: 3, edge: 4 },
  { node: 0, edge: 0 },
  { node: 1, edge: 1 },
  { node: 2, edge: 3 },
  { node: 3, edge: 4 },
]

const css = `
.zc { --zc-line: rgba(255,255,255,.22); --zc-node: rgba(255,255,255,.28); --zc-text: rgba(255,255,255,.5); --zc-bold: rgba(255,255,255,.92); --zc-accent: #48bb78; --zc-fill: rgba(72,187,120,.1); --zc-bg: var(--colors-bg) }
html:not(.dark) .zc { --zc-line: rgba(0,0,0,.2); --zc-node: rgba(0,0,0,.28); --zc-text: rgba(0,0,0,.5); --zc-bold: rgba(0,0,0,.88); --zc-accent: #2f855a; --zc-fill: rgba(47,133,90,.08); --zc-bg: var(--colors-bg) }
@keyframes zc-travel { 0% { stroke-dashoffset: 10; opacity: 0 } 12% { opacity: 1 } 88% { opacity: 1 } 100% { stroke-dashoffset: -100; opacity: 0 } }
.zc-node rect { fill: var(--zc-bg); stroke: var(--zc-node); transition: stroke 240ms, fill 240ms }
.zc-node text { fill: var(--zc-text); transition: fill 240ms }
.zc-node[data-active] rect { stroke: var(--zc-accent); fill: var(--zc-fill) }
.zc-node[data-active] text { fill: var(--zc-bold) }
.zc-edge path { stroke: var(--zc-line); transition: stroke 240ms }
.zc-edge text { fill: var(--zc-text); transition: fill 240ms }
.zc-edge[data-active] text { fill: var(--zc-bold) }
.zc-pulse { stroke-dasharray: 10 200; stroke-dashoffset: 10; animation: zc-travel ${TICK}ms cubic-bezier(.5,0,.3,1) forwards }
@media (prefers-reduced-motion: reduce) {
  .zc-pulse { display: none }
  .zc-node rect, .zc-node text, .zc-edge path, .zc-edge text { transition: none }
}
`

export function HeroStatechart() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(2)
      return
    }
    const id = setInterval(() => setStep((s) => (s + 1) % steps.length), TICK)
    return () => clearInterval(id)
  }, [])

  const current = steps[step]
  const state = nodes[current.node].id
  const event = edges[current.edge].label

  return (
    <Box
      className="zc"
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
      bg="bg"
      overflow="hidden"
    >
      <HStack
        justify="space-between"
        px="4"
        py="3"
        borderBottomWidth="1px"
        borderColor="border"
        fontFamily="mono"
        fontSize="11px"
        letterSpacing="0.08em"
        textTransform="uppercase"
        color="text.muted"
      >
        <span>dialog.machine</span>
        <span>4 states · 5 transitions</span>
      </HStack>
      <Box px={{ base: "2", md: "4" }} py="4">
        <svg
          viewBox="0 0 560 380"
          width="100%"
          aria-label="Statechart of a dialog machine: closed, opening, open and closing, connected by OPEN, ANIMATION_END, CLOSE and ESCAPE events"
        >
          <style>{css}</style>
          <defs>
            <marker
              id="zc-arrow"
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M0 0 L8 4 L0 8 Z" fill="var(--zc-node)" />
            </marker>
          </defs>

          <circle cx="110" cy="22" r="4" fill="var(--zc-node)" />
          <path
            d="M110 26 V56"
            stroke="var(--zc-line)"
            fill="none"
            markerEnd="url(#zc-arrow)"
          />

          {edges.map((e, i) => (
            <g
              key={e.id}
              className="zc-edge"
              data-active={current.edge === i ? "" : undefined}
            >
              <path
                d={e.d}
                fill="none"
                strokeWidth="1"
                markerEnd="url(#zc-arrow)"
              />
              <text
                x={e.lx}
                y={e.ly}
                textAnchor={e.anchor as "start" | "middle" | "end"}
                fontFamily="ui-monospace, monospace"
                fontSize="11"
                letterSpacing="0.06em"
              >
                {e.label}
              </text>
            </g>
          ))}

          <path
            key={step}
            className="zc-pulse"
            d={edges[current.edge].d}
            pathLength={100}
            fill="none"
            stroke="var(--zc-accent)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {nodes.map((n, i) => (
            <g
              key={n.id}
              className="zc-node"
              data-active={current.node === i ? "" : undefined}
            >
              <rect
                x={n.x}
                y={n.y}
                width={W}
                height={H}
                rx="10"
                strokeWidth="1"
              />
              <text
                x={n.x + W / 2}
                y={n.y + H / 2 + 4}
                textAnchor="middle"
                fontFamily="ui-monospace, monospace"
                fontSize="14"
              >
                {n.id}
              </text>
            </g>
          ))}
        </svg>
      </Box>
      <HStack
        px="4"
        py="3"
        gap="2"
        borderTopWidth="1px"
        borderColor="border"
        fontFamily="mono"
        fontSize="12px"
        color="text.muted"
      >
        <styled.span
          w="1.5"
          h="1.5"
          borderRadius="full"
          style={{ background: "var(--zc-accent)" }}
        />
        <span>
          state: <styled.span color="text.bold">{state}</styled.span>
          {" · "}
          event: <styled.span color="text.bold">{event}</styled.span>
        </span>
      </HStack>
    </Box>
  )
}
