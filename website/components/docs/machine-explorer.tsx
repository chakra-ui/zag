"use client"

import { useLayoutEffect, useMemo, useRef, useState } from "react"
import { LuMaximize, LuMinus, LuPlus } from "react-icons/lu"
import * as styles from "./machine-explorer.css"

type Box = { x: number; y: number; w: number; h: number }

export interface MachineGraph {
  id: string
  initial: string
  states: {
    id: string
    label: string
    parent: string | null
    initial: boolean
  }[]
  transitions: {
    from: string
    to: string | null
    event: string
    guard: string | null
  }[]
  layouts: Record<"right" | "down", Layout>
}

type Layout = {
  width: number
  height: number
  states: Record<string, Box>
  edges: {
    from: string
    to: string
    events: string[]
    lines: string[]
    points: [number, number][]
    label: Box | null
  }[]
}

const HUES = 8
const ZOOMS = [0.5, 0.67, 0.8, 1, 1.25]

function roundedPath(points: [number, number][], radius = 10) {
  if (points.length < 2) return ""
  let d = `M ${points[0][0]} ${points[0][1]}`
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i - 1]
    const [cx, cy] = points[i]
    const [nx, ny] = points[i + 1]
    const r = Math.min(
      radius,
      Math.hypot(cx - px, cy - py) / 2,
      Math.hypot(nx - cx, ny - cy) / 2,
    )
    d += ` L ${cx - Math.sign(cx - px) * r} ${cy - Math.sign(cy - py) * r}`
    d += ` Q ${cx} ${cy} ${cx + Math.sign(nx - cx) * r} ${cy + Math.sign(ny - cy) * r}`
  }
  const [lx, ly] = points[points.length - 1]
  return `${d} L ${lx} ${ly}`
}

function arrowHead(points: [number, number][], size = 8) {
  const [tx, ty] = points[points.length - 1]
  const [fx, fy] = points[points.length - 2]
  const angle = Math.atan2(ty - fy, tx - fx)
  const corner = (offset: number) =>
    `${tx - size * Math.cos(angle + offset)} ${ty - size * Math.sin(angle + offset)}`
  return `M ${tx} ${ty} L ${corner(-0.42)} L ${corner(0.42)} Z`
}

const hueStyle = (hue: number) =>
  ({ "--hue": `var(--machine-hue-${hue})` }) as React.CSSProperties

/** The machine's states and transitions, drawn from a layout computed at build time */
export function MachineExplorer(props: { graph: MachineGraph }) {
  const { graph } = props
  const [direction, setDirection] = useState<"right" | "down">("right")
  const layout = graph.layouts[direction]
  const [selected, setSelected] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const viewportRef = useRef<HTMLDivElement>(null)

  const scaleFor = (target: Layout) => {
    const el = viewportRef.current
    if (!el) return 1
    return Math.min(
      (el.clientWidth - 32) / target.width,
      (el.clientHeight - 32) / target.height,
    )
  }
  // zoom to fit, but never so small that labels can't be read
  const fit = (target = layout) => Math.min(1, Math.max(0.5, scaleFor(target)))

  // pick the orientation whose fitted drawing covers more of the dialog, then fit it
  useLayoutEffect(() => {
    const coverage = (target: Layout) => {
      const scale = fit(target)
      return target.width * scale * target.height * scale
    }
    const next =
      coverage(graph.layouts.down) > coverage(graph.layouts.right) * 1.15
        ? "down"
        : "right"
    setDirection(next)
    setZoom(fit(graph.layouts[next]))
  }, [graph])

  const hueOf = useMemo(
    () => new Map(graph.states.map((state, index) => [state.id, index % HUES])),
    [graph],
  )
  const compound = useMemo(
    () =>
      new Set(
        graph.states.flatMap((state) => (state.parent ? [state.parent] : [])),
      ),
    [graph],
  )

  const linked = new Set<string>()
  if (selected) {
    linked.add(selected)
    for (const edge of layout.edges) {
      if (edge.from === selected || edge.to === selected)
        linked.add(edge.from).add(edge.to)
    }
  }
  const dim = (id: string) => (selected && !linked.has(id) ? true : undefined)
  const edgeDim = (from: string, to: string) =>
    selected && from !== selected && to !== selected ? true : undefined

  // a compound initial state starts in its initial child
  let start = graph.initial
  for (;;) {
    const child = graph.states.find(
      (state) => state.parent === start && state.initial,
    )
    if (!child) break
    start = child.id
  }
  const initialBox = layout.states[start]
  const anywhere = graph.transitions.filter((t) => t.from === "*" && t.to)
  const step = (direction: 1 | -1) => {
    const index = ZOOMS.findIndex((value) => value >= zoom)
    setZoom(
      ZOOMS[
        Math.min(
          ZOOMS.length - 1,
          Math.max(0, (index === -1 ? ZOOMS.length - 1 : index) + direction),
        )
      ],
    )
  }

  return (
    <div className={styles.root}>
      {anywhere.length > 0 && (
        <div className={styles.legend}>
          <span className={styles.legendTitle}>From any state</span>
          {anywhere.map((t) => (
            <span key={`${t.event}-${t.to}`} className={styles.legendItem}>
              {t.event} → {t.to}
            </span>
          ))}
        </div>
      )}

      <div className={styles.viewport} ref={viewportRef}>
        <svg
          className={styles.svg}
          width={layout.width * zoom}
          height={layout.height * zoom}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          aria-label={`${graph.id} state diagram`}
        >
          {/* compound states sit behind everything as dashed regions */}
          {graph.states
            .filter((state) => compound.has(state.id))
            .map((state) => {
              const box = layout.states[state.id]
              return (
                <g
                  key={state.id}
                  style={hueStyle(hueOf.get(state.id)!)}
                  className={styles.fade}
                  data-dim={dim(state.id)}
                >
                  <rect
                    x={box.x}
                    y={box.y}
                    width={box.w}
                    height={box.h}
                    rx={18}
                    className={styles.group}
                  />
                  <text
                    x={box.x + 18}
                    y={box.y + 26}
                    className={styles.groupLabel}
                  >
                    {state.label}
                  </text>
                </g>
              )
            })}

          {layout.edges.map((edge) => (
            <g
              key={`${edge.from}->${edge.to}`}
              style={hueStyle(hueOf.get(edge.from)!)}
              className={styles.fadeEdge}
              data-dim={edgeDim(edge.from, edge.to)}
            >
              <path d={roundedPath(edge.points)} className={styles.edgePath} />
              <path d={arrowHead(edge.points)} className={styles.arrow} />
              {edge.label && (
                <g>
                  <title>{edge.events.join("\n")}</title>
                  <rect
                    x={edge.label.x}
                    y={edge.label.y}
                    width={edge.label.w}
                    height={edge.label.h}
                    rx={6}
                    className={styles.labelBox}
                  />
                  {edge.lines.map((line, index) => (
                    <text
                      key={line}
                      x={edge.label!.x + 8}
                      y={edge.label!.y + 16 + index * 16}
                      className={styles.labelText}
                    >
                      {line}
                    </text>
                  ))}
                </g>
              )}
            </g>
          ))}

          {initialBox && (
            <g className={styles.start}>
              <circle
                cx={initialBox.x - 26}
                cy={initialBox.y + initialBox.h / 2}
                r={6}
              />
              <path
                d={`M ${initialBox.x - 20} ${initialBox.y + initialBox.h / 2} L ${initialBox.x - 4} ${initialBox.y + initialBox.h / 2}`}
              />
            </g>
          )}

          {graph.states
            .filter((state) => !compound.has(state.id))
            .map((state) => {
              const box = layout.states[state.id]
              return (
                <g
                  key={state.id}
                  style={hueStyle(hueOf.get(state.id)!)}
                  className={styles.fade}
                  data-dim={dim(state.id)}
                  // svg has no <button>, so the state group takes the role
                  // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
                  role="button"
                  tabIndex={0}
                  aria-pressed={selected === state.id}
                  aria-label={`Trace ${state.label}`}
                  onClick={(event) => {
                    event.stopPropagation()
                    setSelected((current) =>
                      current === state.id ? null : state.id,
                    )
                  }}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ") return
                    event.preventDefault()
                    setSelected((current) =>
                      current === state.id ? null : state.id,
                    )
                  }}
                >
                  <rect
                    x={box.x}
                    y={box.y}
                    width={box.w}
                    height={box.h}
                    rx={box.h / 2}
                    className={styles.node}
                  />
                  <text
                    x={box.x + box.w / 2}
                    y={box.y + box.h / 2}
                    className={styles.nodeText}
                  >
                    {state.label}
                  </text>
                </g>
              )
            })}
        </svg>
      </div>

      <div className={styles.zoom}>
        <button
          type="button"
          className={styles.zoomButton}
          onClick={() => step(-1)}
          aria-label="Zoom out"
        >
          <LuMinus aria-hidden />
        </button>
        <button
          type="button"
          className={styles.zoomButton}
          onClick={() => setZoom(fit())}
          aria-label="Fit to view"
        >
          <LuMaximize aria-hidden />
        </button>
        <button
          type="button"
          className={styles.zoomButton}
          onClick={() => step(1)}
          aria-label="Zoom in"
        >
          <LuPlus aria-hidden />
        </button>
      </div>
    </div>
  )
}
