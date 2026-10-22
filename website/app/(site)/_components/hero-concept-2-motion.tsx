"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import type { CSSProperties, ReactNode } from "react"
import { duration, ease, swapBlur } from "./motion"

export interface Clock {
  wait(ms: number): Promise<void>
  pause(): void
  resume(): void
  dispose(): void
}

interface Timer {
  due: number
  fn: () => void
  id?: ReturnType<typeof setTimeout>
}

export function createClock(root: () => Element | null): Clock {
  let running = false
  let disposed = false
  let base = 0
  let since = 0
  let held: Animation[] = []
  const timers = new Set<Timer>()
  const now = () => (running ? base + performance.now() - since : base)
  const arm = (t: Timer) => {
    t.id = setTimeout(
      () => {
        timers.delete(t)
        t.fn()
      },
      Math.max(0, t.due - now()),
    )
  }
  return {
    wait(ms) {
      return new Promise((resolve) => {
        if (disposed) return
        const t: Timer = { due: now() + ms, fn: resolve }
        timers.add(t)
        if (running) arm(t)
      })
    },
    pause() {
      if (!running) return
      base = now()
      running = false
      timers.forEach((t) => clearTimeout(t.id))
      held = (root()?.getAnimations({ subtree: true }) ?? []).filter(
        (a) => a.playState === "running",
      )
      held.forEach((a) => a.pause())
    },
    resume() {
      if (running || disposed) return
      since = performance.now()
      running = true
      held.forEach((a) => a.play())
      held = []
      timers.forEach(arm)
    },
    dispose() {
      disposed = true
      running = false
      timers.forEach((t) => clearTimeout(t.id))
      timers.clear()
      held.forEach((a) => a.play())
      held = []
    },
  }
}

const omega = 12
const zeta = 0.7

export const springMs = 720

export function springAt(ms: number) {
  const t = ms / 1000
  const wd = omega * Math.sqrt(1 - zeta * zeta)
  return (
    1 -
    Math.exp(-zeta * omega * t) *
      (Math.cos(wd * t) + ((zeta * omega) / wd) * Math.sin(wd * t))
  )
}

const samples = 40

const springLinear = `linear(${Array.from({ length: samples + 1 }, (_, i) =>
  i === samples ? 1 : +springAt((i / samples) * springMs).toFixed(4),
).join(", ")})`

export function springEasing() {
  return typeof CSS !== "undefined" &&
    CSS.supports("transition-timing-function", "linear(0, 1)")
    ? springLinear
    : ease.out
}

export function usePrefersReduced() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])
  return reduced
}

export function tr(props: string[], ms: number, curve: string) {
  return props.map((p) => `${p} ${ms}ms ${curve}`).join(", ")
}

type SwapMode = "panel" | "word" | "text"

function frames(mode: SwapMode, reduced: boolean, dir: "in" | "out") {
  const soft = mode === "text" ? "blur(2px)" : swapBlur
  const hidden: Keyframe = { opacity: 0, filter: soft }
  if (!reduced && mode === "panel" && dir === "in")
    hidden.transform = "scale(0.98)"
  if (!reduced && mode === "word")
    hidden.transform = dir === "in" ? "translateY(0.2em)" : "translateY(-0.2em)"
  const shown: Keyframe = { opacity: 1, filter: "blur(0px)" }
  if (hidden.transform) shown.transform = "none"
  return dir === "in" ? [hidden, shown] : [shown, hidden]
}

function Layer(props: {
  mode: SwapMode
  reduced: boolean
  current: boolean
  animateIn: boolean
  onDone: () => void
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [animateIn] = useState(props.animateIn)
  const { mode, reduced, current, onDone } = props
  const doneRef = useRef(onDone)

  useEffect(() => {
    doneRef.current = onDone
  })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || !animateIn) return
    const a = el.animate(frames(mode, reduced, "in"), {
      duration: duration.swap,
      easing: ease.out,
    })
    return () => a.cancel()
  }, [animateIn, mode, reduced])

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || current) return
    const a = el.animate(frames(mode, reduced, "out"), {
      duration: mode === "panel" ? duration.open : duration.swap - 60,
      easing: ease.out,
      fill: "forwards",
    })
    a.finished.then(() => doneRef.current()).catch(() => {})
    return () => a.cancel()
  }, [current, mode, reduced])

  const style: CSSProperties = {
    gridArea: "1 / 1",
    minWidth: 0,
    pointerEvents: current ? undefined : "none",
  }
  if (mode === "panel") {
    Object.assign(style, {
      display: "flex",
      flexDirection: "column",
      minHeight: 0,
      transformOrigin: "50% 40%",
    })
  }
  if (mode === "word") {
    Object.assign(style, { justifySelf: "start", whiteSpace: "nowrap" })
  }
  if (mode === "text") {
    Object.assign(style, { whiteSpace: "nowrap" })
  }

  return (
    <div
      ref={ref}
      style={style}
      data-swap-current={current ? "" : undefined}
      aria-hidden={current ? undefined : true}
      inert={!current}
    >
      {props.children}
    </div>
  )
}

export function Swap(props: {
  id: string
  mode: SwapMode
  reduced?: boolean
  children: ReactNode
  style?: CSSProperties
}) {
  const { id, mode } = props
  const reduced = !!props.reduced
  const nodes = useRef(new Map<string, ReactNode>())
  const [ids, setIds] = useState([id])
  const [ready, setReady] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const sized = useRef(false)

  nodes.current.set(id, props.children)
  if (ids[ids.length - 1] !== id) setIds([...ids.filter((x) => x !== id), id])

  useEffect(() => {
    setReady(true)
  }, [])

  useLayoutEffect(() => {
    if (mode !== "word") return
    const box = boxRef.current
    const el = box?.querySelector<HTMLElement>(":scope > [data-swap-current]")
    if (!box || !el) return
    const fit = (animate: boolean) => {
      box.style.transition =
        animate && !reduced ? `width ${duration.swap}ms ${ease.inOut}` : "none"
      box.style.width = `${el.getBoundingClientRect().width}px`
    }
    fit(sized.current)
    sized.current = true
    const ro = new ResizeObserver(() => fit(false))
    ro.observe(el)
    return () => ro.disconnect()
  }, [id, mode, reduced])

  return (
    <div
      ref={boxRef}
      style={{
        display: mode === "panel" ? "grid" : "inline-grid",
        gridTemplateColumns: mode === "panel" ? "minmax(0, 1fr)" : undefined,
        gridTemplateRows: mode === "panel" ? "minmax(0, 1fr)" : undefined,
        height: mode === "panel" ? "100%" : undefined,
        verticalAlign: "bottom",
        ...props.style,
      }}
    >
      {ids.map((x) => (
        <Layer
          key={x}
          mode={mode}
          reduced={reduced}
          current={x === id}
          animateIn={ready}
          onDone={() => {
            nodes.current.delete(x)
            setIds((prev) => prev.filter((y) => y !== x))
          }}
        >
          {nodes.current.get(x)}
        </Layer>
      ))}
    </div>
  )
}
