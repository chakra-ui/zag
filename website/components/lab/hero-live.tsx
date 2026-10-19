"use client"

import * as checkbox from "@zag-js/checkbox"
import * as rating from "@zag-js/rating-group"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as slider from "@zag-js/slider"
import * as zagSwitch from "@zag-js/switch"
import * as toggleGroup from "@zag-js/toggle-group"
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"

const W = 560
const H = 500

const style = `
.zdesk { --desk: #131315; --dot: rgba(255,255,255,.085); --frame: rgba(255,255,255,.1); --obj: #1c1c20; --objb: rgba(255,255,255,.1); --ink: #f4f4f5; --mute: rgba(255,255,255,.48); --a: #48bb78; --as: rgba(72,187,120,.14); --track: rgba(255,255,255,.12); --knob: #f4f4f5; --lead: rgba(255,255,255,.34); --cur: #fafafa; --curs: #0b0b0c; --sh: 0 1px 0 rgba(255,255,255,.05) inset, 0 14px 30px -16px rgba(0,0,0,.9), 0 2px 6px -2px rgba(0,0,0,.5); --tsh: 0 6px 14px -8px rgba(0,0,0,.7); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
html:not(.dark) .zdesk { --desk: #f7f7f5; --dot: rgba(0,0,0,.13); --frame: rgba(0,0,0,.1); --obj: #ffffff; --objb: rgba(0,0,0,.1); --ink: #111113; --mute: rgba(0,0,0,.5); --a: #2f855a; --as: rgba(47,133,90,.1); --track: rgba(0,0,0,.1); --knob: #ffffff; --lead: rgba(0,0,0,.34); --cur: #111113; --curs: #ffffff; --sh: 0 1px 2px rgba(0,0,0,.06), 0 12px 26px -16px rgba(0,0,0,.28); --tsh: 0 4px 10px -6px rgba(0,0,0,.18); }
.zdesk-canvas { position: relative; border: 1px solid var(--frame); border-radius: 14px; background-color: var(--desk); background-image: radial-gradient(var(--dot) 1px, transparent 1.4px); background-size: 18px 18px; background-position: 9px 9px; overflow: hidden; }
.zd-stage { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; transform-origin: 0 0; }
.zd-obj { position: absolute; background: var(--obj); border: 1px solid var(--objb); border-radius: 10px; box-shadow: var(--sh); color: var(--ink); font-family: var(--fonts-body, system-ui), system-ui, sans-serif; font-size: 13px; }
.zd-sel { position: absolute; inset: -7px; border: 1px dashed var(--a); border-radius: 13px; opacity: 0; transition: opacity 180ms; pointer-events: none; }
.zd-sel i { position: absolute; width: 5px; height: 5px; background: var(--desk); border: 1px solid var(--a); }
.zd-sel i:nth-child(1) { left: -3px; top: -3px } .zd-sel i:nth-child(2) { right: -3px; top: -3px } .zd-sel i:nth-child(3) { left: -3px; bottom: -3px } .zd-sel i:nth-child(4) { right: -3px; bottom: -3px }
.zd-obj[data-active] .zd-sel { opacity: 1 }
.zd-cap { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: var(--mute); }
.zd-sw { display: flex; align-items: center; gap: 18px; padding: 14px 16px; cursor: pointer; user-select: none; }
.zd-sw-track { position: relative; width: 40px; height: 24px; border-radius: 99px; background: var(--track); transition: background 200ms; box-shadow: inset 0 1px 2px rgba(0,0,0,.18); }
.zd-sw-track[data-state=checked] { background: var(--a); }
.zd-sw-thumb { position: absolute; left: 3px; top: 3px; width: 18px; height: 18px; border-radius: 99px; background: var(--knob); box-shadow: 0 1px 3px rgba(0,0,0,.35); transition: transform 220ms cubic-bezier(.3,1.4,.5,1); }
.zd-sw-thumb[data-state=checked] { transform: translateX(16px); }
.zd-stars { display: flex; gap: 4px; margin-top: 8px; }
.zd-star { width: 26px; height: 26px; display: grid; place-items: center; cursor: pointer; border-radius: 6px; outline: none; }
.zd-star svg { width: 22px; height: 22px; fill: transparent; stroke: var(--mute); stroke-width: 1.4; transition: fill 120ms, stroke 120ms, transform 160ms; }
.zd-star[data-highlighted] svg { fill: var(--a); stroke: var(--a); }
.zd-star:focus-visible { box-shadow: 0 0 0 2px var(--a); }
.zd-pad-sl { padding: 12px 16px 10px; }
.zd-pad-rt { padding: 12px 14px; }
.zd-sl-head { display: flex; justify-content: space-between; align-items: baseline; }
.zd-sl-out { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; font-variant-numeric: tabular-nums; color: var(--ink); }
.zd-sl-ctl { position: relative; display: flex; align-items: center; height: 26px; margin-top: 6px; touch-action: none; cursor: pointer; }
.zd-sl-track { flex: 1; height: 4px; border-radius: 99px; background: var(--track); }
.zd-sl-range { height: 100%; border-radius: inherit; background: var(--a); }
.zd-sl-thumb { width: 18px; height: 18px; border-radius: 99px; background: var(--knob); border: 1px solid var(--objb); box-shadow: 0 1px 4px rgba(0,0,0,.35); outline: none; cursor: grab; }
.zd-sl-thumb:focus-visible { box-shadow: 0 0 0 2px var(--a); }
.zd-ticks { display: flex; justify-content: space-between; margin-top: 4px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 9px; color: var(--mute); }
.zd-ticks span { display: flex; flex-direction: column; align-items: center; gap: 3px; width: 0; }
.zd-ticks span::before { content: ""; width: 1px; height: 4px; background: var(--lead); }
.zd-seg { display: flex; padding: 4px; gap: 2px; outline: none; }
.zd-seg-item { display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 11px; border-radius: 7px; color: var(--mute); font-size: 12.5px; cursor: pointer; transition: background 160ms, color 160ms, box-shadow 160ms; outline: none; }
.zd-seg-item:hover { color: var(--ink); }
.zd-seg-item[data-state=on] { background: var(--as); color: var(--a); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--a) 45%, transparent); }
.zd-seg-item:focus-visible { box-shadow: 0 0 0 2px var(--a); }
.zd-seg-item svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 1.5; }
.zd-cb { display: flex; align-items: center; gap: 12px; padding: 15px 18px; cursor: pointer; user-select: none; }
.zd-cb-box { width: 20px; height: 20px; border-radius: 6px; border: 1.5px solid var(--lead); display: grid; place-items: center; color: var(--obj); transition: background 160ms, border-color 160ms; }
.zd-cb-box[data-state=checked], .zd-cb-box[data-state=indeterminate] { background: var(--a); border-color: var(--a); }
.zd-cb-box[data-focus-visible], .zd-sw-track[data-focus-visible] { outline: 2px solid var(--a); outline-offset: 2px; }
.zd-cb-box svg { width: 12px; height: 12px; fill: none; stroke: currentColor; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round; }
.zd-tag { position: absolute; display: flex; flex-direction: column; gap: 2px; padding: 6px 9px 7px; background: var(--obj); border: 1px solid var(--objb); border-radius: 6px; box-shadow: var(--tsh); font-size: 11px; line-height: 1.35; color: var(--mute); white-space: nowrap; transition: border-color 700ms, background 700ms; }
.zd-tag b { font-weight: 500; color: var(--ink); transition: color 700ms; }
.zd-tag-k { font-size: 9.5px; letter-spacing: .08em; text-transform: uppercase; }
.zd-tag-k::before { content: ""; display: inline-block; width: 5px; height: 5px; margin-right: 6px; border-radius: 99px; background: var(--lead); vertical-align: 1px; transition: background 700ms; }
.zd-tag[data-flash] { border-color: var(--a); background: color-mix(in srgb, var(--a) 9%, var(--obj)); transition: none; }
.zd-tag[data-flash] b { color: var(--a); transition: none; }
.zd-tag[data-flash] .zd-tag-k::before { background: var(--a); transition: none; }
.zd-lines { position: absolute; inset: 0; pointer-events: none; overflow: visible; }
.zd-lines path { stroke: var(--lead); stroke-dasharray: 2 4; fill: none; transition: stroke 700ms; }
.zd-lines circle { fill: var(--lead); transition: fill 700ms; }
.zd-lines g[data-flash] path { stroke: var(--a); transition: none; }
.zd-lines g[data-flash] circle { fill: var(--a); transition: none; }
.zd-cur { position: absolute; left: 0; top: 0; width: 22px; height: 26px; pointer-events: none; opacity: 0; transition: opacity 400ms; will-change: transform; z-index: 5; }
.zd-cur[data-on] { opacity: 1; }
.zd-cur svg { position: absolute; left: -3px; top: -2px; width: 22px; height: 26px; transform-origin: 3px 2px; transition: transform 120ms; filter: drop-shadow(0 2px 3px rgba(0,0,0,.3)); }
.zd-cur svg path { fill: var(--cur); stroke: var(--curs); stroke-width: 1.4; stroke-linejoin: round; }
.zd-cur[data-down] svg { transform: scale(.86); }
.zd-cur i { position: absolute; left: -12px; top: -12px; width: 24px; height: 24px; border-radius: 99px; border: 1.5px solid var(--a); opacity: 0; transform: scale(.4); }
.zd-cur[data-down] i { animation: zd-ring 520ms ease-out; }
@keyframes zd-ring { 0% { opacity: .9; transform: scale(.4) } 100% { opacity: 0; transform: scale(1.5) } }
.zd-foot { display: flex; justify-content: space-between; gap: 12px; padding: 10px 2px 0; font-size: 11px; color: var(--mute); }
.zd-foot b { font-weight: 500; color: var(--ink); }
.zd-live { display: inline-flex; align-items: center; gap: 7px; }
.zd-live::before { content: ""; width: 6px; height: 6px; border-radius: 99px; background: var(--a); box-shadow: 0 0 0 3px var(--as); }
.zd-compact { display: flex; flex-direction: column; gap: 14px; padding: 18px; }
.zd-compact .zd-obj, .zd-compact .zd-tag { position: relative; left: auto !important; top: auto !important; }
.zd-compact .zd-row { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; }
.zd-compact .zd-row:nth-child(even) { align-items: flex-end; }
@media (prefers-reduced-motion: reduce) { .zd-sw-track, .zd-sw-thumb, .zd-star svg, .zd-seg-item, .zd-cb-box, .zd-tag, .zd-tag b, .zd-lines path { transition: none !important } }
`

type Key = "switch" | "rating" | "slider" | "toggle" | "checkbox"

const layout: Record<
  Key,
  { obj: [number, number]; tag: [number, number, number] }
> = {
  switch: { obj: [52, 114], tag: [34, 24, -1.6] },
  rating: { obj: [304, 46], tag: [390, 156, 1.4] },
  slider: { obj: [78, 226], tag: [404, 252, -1.1] },
  toggle: { obj: [34, 370], tag: [92, 430, 1.2] },
  checkbox: { obj: [336, 354], tag: [354, 426, -1.8] },
}

const keys = Object.keys(layout) as Key[]

const segments = [
  { value: "list", path: "M2 4h10M2 7h10M2 10h10" },
  { value: "grid", path: "M2 2h4v4H2zM8 2h4v4H8zM2 8h4v4H2zM8 8h4v4H8z" },
  { value: "board", path: "M2 2h2.5v10H2zM5.75 2h2.5v7h-2.5zM9.5 2H12v5H9.5z" },
]

const star =
  "M12 2.8l2.75 5.6 6.15.9-4.45 4.33 1.05 6.12L12 16.85l-5.5 2.9 1.05-6.12L3.1 9.3l6.15-.9z"

type Pt = { x: number; y: number }
type Rect = { x: number; y: number; w: number; h: number }

function edge(r: Rect, to: Pt, pad: number): Pt {
  const cx = r.x + r.w / 2
  const cy = r.y + r.h / 2
  const dx = to.x - cx
  const dy = to.y - cy
  const s = Math.min(
    (r.w / 2 + pad) / Math.abs(dx || 1e-6),
    (r.h / 2 + pad) / Math.abs(dy || 1e-6),
  )
  return { x: cx + dx * s, y: cy + dy * s }
}

const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

class Stop extends Error {}

function Tag(props: {
  id: Key
  name: string
  value: ReactNode
  attr: ReactNode
  signal: string
  onFlash: (k: Key, on: boolean) => void
}) {
  const [flash, setFlash] = useState(false)
  const prev = useRef(props.signal)
  const { id, onFlash, signal } = props
  useEffect(() => {
    if (prev.current === signal) return
    prev.current = signal
    setFlash(true)
    onFlash(id, true)
    const t = setTimeout(() => {
      setFlash(false)
      onFlash(id, false)
    }, 650)
    return () => clearTimeout(t)
  }, [signal, id, onFlash])
  const [x, y, r] = layout[id].tag
  return (
    <div
      className="zd-tag"
      data-tag={id}
      data-flash={flash ? "" : undefined}
      style={{ left: x, top: y, transform: `rotate(${r}deg)` }}
    >
      <span className="zd-tag-k">{props.name}</span>
      <span>{props.value}</span>
      <span>{props.attr}</span>
    </div>
  )
}

function Obj(props: {
  id: Key
  active: boolean
  width?: number
  onEnter: (k: Key | null) => void
  children: ReactNode
}) {
  const [x, y] = layout[props.id].obj
  return (
    <div
      className="zd-obj"
      data-obj={props.id}
      data-active={props.active ? "" : undefined}
      style={{ left: x, top: y, width: props.width }}
      onPointerEnter={() => props.onEnter(props.id)}
      onPointerLeave={() => props.onEnter(null)}
    >
      {props.children}
      <span className="zd-sel" aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </span>
    </div>
  )
}

export function HeroLive() {
  const swService = useMachine(zagSwitch.machine, {
    id: "desk-switch",
    defaultChecked: true,
  })
  const sw = zagSwitch.connect(swService, normalizeProps)
  const slService = useMachine(slider.machine, {
    id: "desk-slider",
    defaultValue: [42],
    thumbAlignment: "center",
    thumbSize: { width: 18, height: 18 },
  })
  const sl = slider.connect(slService, normalizeProps)
  const rtService = useMachine(rating.machine, {
    id: "desk-rating",
    count: 5,
    defaultValue: 3,
  })
  const rt = rating.connect(rtService, normalizeProps)
  const tg = toggleGroup.connect(
    useMachine(toggleGroup.machine, {
      id: "desk-toggle",
      defaultValue: ["list"],
      deselectable: false,
    }),
    normalizeProps,
  )
  const cbService = useMachine(checkbox.machine, {
    id: "desk-checkbox",
    defaultChecked: "indeterminate",
  })
  const cb = checkbox.connect(cbService, normalizeProps)

  const apis = useRef({ sw, sl, rt, tg, cb, rtService, swService, cbService })
  apis.current = { sw, sl, rt, tg, cb, rtService, swService, cbService }

  const wrapRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const curRef = useRef<HTMLDivElement>(null)
  const scaleRef = useRef(1)
  const visible = useRef(true)
  const ctl = useRef({ alive: true })

  const [scale, setScale] = useState(1)
  const [compact, setCompact] = useState(false)
  const [ghost, setGhost] = useState(true)
  const [active, setActive] = useState<Key | null>(null)
  const [lines, setLines] = useState<{ id: Key; d: string; dot: Pt }[]>([])
  const [flashing, setFlashing] = useState<Partial<Record<Key, boolean>>>({})
  const onFlash = useRef((k: Key, on: boolean) =>
    setFlashing((f) => (f[k] === on ? f : { ...f, [k]: on })),
  ).current

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      const s = Math.min(1, w / W)
      scaleRef.current = s
      setScale(s)
      setCompact(w < 440)
    })
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [])

  const local = (el: Element): Rect => {
    const stage = stageRef.current!.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    const s = scaleRef.current
    return {
      x: (r.left - stage.left) / s,
      y: (r.top - stage.top) / s,
      w: r.width / s,
      h: r.height / s,
    }
  }

  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage || compact) return
    const measure = () => {
      const next = keys.map((id) => {
        const o = local(stage.querySelector(`[data-obj="${id}"]`)!)
        const t = local(stage.querySelector(`[data-tag="${id}"]`)!)
        const oc = { x: o.x + o.w / 2, y: o.y + o.h / 2 }
        const tc = { x: t.x + t.w / 2, y: t.y + t.h / 2 }
        const a = edge(o, tc, 9)
        const b = edge(t, oc, 3)
        const mx = (a.x + b.x) / 2
        return {
          id,
          d: `M${a.x.toFixed(1)} ${a.y.toFixed(1)} C${mx.toFixed(1)} ${a.y.toFixed(1)} ${mx.toFixed(1)} ${b.y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`,
          dot: a,
        }
      })
      setLines(next)
    }
    measure()
    const ro = new ResizeObserver(measure)
    stage
      .querySelectorAll("[data-obj],[data-tag]")
      .forEach((el) => ro.observe(el))
    return () => ro.disconnect()
  }, [compact, scale])

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const io = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting
    })
    io.observe(wrap)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!ghost) return
    const wrap = wrapRef.current
    if (!wrap) return
    const stop = () => {
      ctl.current.alive = false
      if (apis.current.rt.hovering)
        apis.current.rtService.send({ type: "GROUP_POINTER_LEAVE" })
      setGhost(false)
      setActive(null)
    }
    const evs = [
      "pointerdown",
      "pointermove",
      "keydown",
      "focusin",
      "wheel",
      "touchstart",
    ] as const
    evs.forEach((e) => wrap.addEventListener(e, stop, { passive: true }))
    return () => evs.forEach((e) => wrap.removeEventListener(e, stop))
  }, [ghost])

  useEffect(() => {
    if (compact || !ghost) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setGhost(false)
      return
    }
    const cur = curRef.current
    const stage = stageRef.current
    if (!cur || !stage) return
    const token = { alive: true }
    ctl.current = token
    const pos = { x: 512, y: 430 }
    const place = (p: Pt) => {
      pos.x = p.x
      pos.y = p.y
      cur.style.transform = `translate(${p.x}px, ${p.y}px)`
    }
    place(pos)

    const frames = (ms: number, fn?: (t: number) => void) =>
      new Promise<void>((resolve, reject) => {
        let elapsed = 0
        let last = performance.now()
        const step = (now: number) => {
          if (!token.alive) return reject(new Stop())
          const dt = Math.min(now - last, 50)
          last = now
          if (visible.current && !document.hidden) elapsed += dt
          const t = Math.min(elapsed / ms, 1)
          fn?.(t)
          if (t >= 1) return resolve()
          requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      })
    const wait = (ms: number) => frames(ms)

    const move = (to: Pt, ms?: number) => {
      const from = { ...pos }
      const dx = to.x - from.x
      const dy = to.y - from.y
      const len = Math.hypot(dx, dy)
      const bend = Math.min(len * 0.18, 60) * (dx > 0 ? 1 : -1)
      const nx = -dy / (len || 1)
      const ny = dx / (len || 1)
      const c1 = {
        x: from.x + dx * 0.3 + nx * bend,
        y: from.y + dy * 0.3 + ny * bend,
      }
      const c2 = {
        x: from.x + dx * 0.75 + nx * bend * 0.4,
        y: from.y + dy * 0.75 + ny * bend * 0.4,
      }
      const dur = ms ?? Math.min(420 + len * 1.4, 1100)
      return frames(dur, (raw) => {
        const t = ease(raw)
        const u = 1 - t
        place({
          x:
            u * u * u * from.x +
            3 * u * u * t * c1.x +
            3 * u * t * t * c2.x +
            t * t * t * to.x,
          y:
            u * u * u * from.y +
            3 * u * u * t * c1.y +
            3 * u * t * t * c2.y +
            t * t * t * to.y,
        })
      })
    }

    const down = () => {
      cur.removeAttribute("data-down")
      void cur.offsetWidth
      cur.setAttribute("data-down", "")
    }
    const up = () => cur.removeAttribute("data-down")
    const tap = async () => {
      down()
      await wait(130)
      up()
    }

    const center = (sel: string, dx = 0, dy = 0): Pt => {
      const r = local(stage.querySelector(sel)!)
      return { x: r.x + r.w / 2 + dx, y: r.y + r.h / 2 + dy }
    }

    const A = () => apis.current

    const run = async () => {
      await wait(700)
      cur.setAttribute("data-on", "")
      await wait(300)
      for (let i = 0; ; i++) {
        setActive("switch")
        await move(center('[data-hit="switch"]', 2, 2))
        await tap()
        A().swService.send({
          type: "CHECKED.SET",
          checked: !A().sw.checked,
          isTrusted: true,
        })
        await wait(650)

        setActive("slider")
        await move(center('[data-hit="thumb"]', 1, 2))
        down()
        await wait(140)
        const ctlRect = local(stage.querySelector('[data-hit="rail"]')!)
        const from = A().sl.value[0]
        const to = [78, 24, 61][i % 3]
        const y = ctlRect.y + ctlRect.h / 2 + 2
        await frames(1000, (raw) => {
          const v = Math.round(from + (to - from) * ease(raw))
          if (v !== A().sl.value[0]) A().sl.setValue([v])
          place({ x: ctlRect.x + (v / 100) * ctlRect.w + 1, y })
        })
        await wait(120)
        up()
        await wait(380)

        setActive("rating")
        const pick = [5, 2, 4][i % 3]
        await move(center('[data-hit="star-1"]', 0, 3))
        A().rtService.send({ type: "GROUP_POINTER_OVER" })
        for (let k = 1; k <= 5; k++) {
          if (k > 1) await move(center(`[data-hit="star-${k}"]`, 0, 3), 150)
          A().rtService.send({
            type: "POINTER_OVER",
            index: k,
            isMidway: false,
          })
          await wait(70)
        }
        for (let k = 4; k >= pick; k--) {
          await move(center(`[data-hit="star-${k}"]`, 0, 3), 190)
          A().rtService.send({
            type: "POINTER_OVER",
            index: k,
            isMidway: false,
          })
          await wait(80)
        }
        await wait(260)
        await tap()
        A().rt.setValue(pick)
        await wait(300)
        await move({ x: pos.x + 20, y: pos.y + 54 }, 320)
        A().rtService.send({ type: "GROUP_POINTER_LEAVE" })

        setActive("toggle")
        const seg = ["grid", "board", "list"][i % 3]
        await move(center(`[data-hit="seg-${seg}"]`, 0, 2))
        await tap()
        A().tg.setValue([seg])
        await wait(550)

        setActive("checkbox")
        await move(center('[data-hit="checkbox"]', 1, 2))
        await tap()
        A().cbService.send({
          type: "CHECKED.SET",
          checked: A().cb.checkedState !== true,
          isTrusted: true,
        })
        await wait(600)

        setActive(null)
        await move({ x: 500 - (i % 2) * 260, y: 300 + (i % 2) * 6 }, 1000)
        await wait(1500)
      }
    }
    run().catch((e) => {
      if (!(e instanceof Stop)) throw e
    })
    return () => {
      token.alive = false
      cur.removeAttribute("data-on")
      cur.removeAttribute("data-down")
    }
  }, [compact, ghost])

  const swState = String(
    (sw.getControlProps() as Record<string, unknown>)["data-state"],
  )
  const cbState = String(
    (cb.getControlProps() as Record<string, unknown>)["data-state"],
  )
  const hover = (k: Key | null) => {
    if (!ghost) setActive(k)
  }

  const objects = {
    switch: (
      <label {...sw.getRootProps()} className="zd-sw">
        <span {...sw.getLabelProps()}>Wi-Fi</span>
        <input {...sw.getHiddenInputProps()} />
        <span
          {...sw.getControlProps()}
          className="zd-sw-track"
          data-hit="switch"
        >
          <span {...sw.getThumbProps()} className="zd-sw-thumb" />
        </span>
      </label>
    ),
    rating: (
      <div {...rt.getRootProps()} className="zd-pad-rt">
        <label {...rt.getLabelProps()} className="zd-cap">
          Rate the docs
        </label>
        <div {...rt.getControlProps()} className="zd-stars">
          {rt.items.map((index) => (
            <span
              key={index}
              {...rt.getItemProps({ index })}
              className="zd-star"
              data-hit={`star-${index}`}
            >
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d={star} strokeLinejoin="round" />
              </svg>
            </span>
          ))}
        </div>
        <input {...rt.getHiddenInputProps()} />
      </div>
    ),
    slider: (
      <div {...sl.getRootProps()} className="zd-pad-sl">
        <div className="zd-sl-head">
          <label {...sl.getLabelProps()} className="zd-cap">
            Volume
          </label>
          <output {...sl.getValueTextProps()} className="zd-sl-out">
            {sl.value[0]}
          </output>
        </div>
        <div {...sl.getControlProps()} className="zd-sl-ctl" data-hit="rail">
          <div {...sl.getTrackProps()} className="zd-sl-track">
            <div {...sl.getRangeProps()} className="zd-sl-range" />
          </div>
          <div
            {...sl.getThumbProps({ index: 0 })}
            className="zd-sl-thumb"
            data-hit="thumb"
          >
            <input {...sl.getHiddenInputProps({ index: 0 })} />
          </div>
        </div>
        <div className="zd-ticks" aria-hidden>
          {[0, 25, 50, 75, 100].map((n) => (
            <span key={n}>{n}</span>
          ))}
        </div>
      </div>
    ),
    toggle: (
      <div {...tg.getRootProps()} className="zd-seg" aria-label="Layout">
        {segments.map((s) => (
          <button
            key={s.value}
            {...tg.getItemProps({ value: s.value })}
            data-hit={`seg-${s.value}`}
            className="zd-seg-item"
          >
            <svg viewBox="0 0 14 14" aria-hidden>
              <path d={s.path} />
            </svg>
            {s.value}
          </button>
        ))}
      </div>
    ),
    checkbox: (
      <label {...cb.getRootProps()} className="zd-cb">
        <span
          {...cb.getControlProps()}
          className="zd-cb-box"
          data-hit="checkbox"
        >
          {cb.checkedState === true && (
            <svg viewBox="0 0 16 16" aria-hidden>
              <path d="M3.5 8.5l3 3 6-6.5" />
            </svg>
          )}
          {cb.checkedState === "indeterminate" && (
            <svg viewBox="0 0 16 16" aria-hidden>
              <path d="M4 8h8" />
            </svg>
          )}
        </span>
        <span {...cb.getLabelProps()}>Ship on Friday</span>
        <input {...cb.getHiddenInputProps()} />
      </label>
    ),
  }

  const tags: Record<
    Key,
    { name: string; value: ReactNode; attr: ReactNode; signal: string }
  > = {
    switch: {
      name: "switch",
      value: (
        <>
          checked: <b>{String(sw.checked)}</b>
        </>
      ),
      attr: (
        <>
          data-state=<b>"{swState}"</b>
        </>
      ),
      signal: String(sw.checked),
    },
    rating: {
      name: "rating-group",
      value: (
        <>
          value: <b>{rt.value}</b>
        </>
      ),
      attr: (
        <>
          hoveredValue: <b>{rt.hoveredValue}</b>
        </>
      ),
      signal: String(rt.value),
    },
    slider: {
      name: "slider",
      value: (
        <>
          value: <b>[{sl.value.join(", ")}]</b>
        </>
      ),
      attr: (
        <>
          aria-valuenow=<b>"{sl.value[0]}"</b>
        </>
      ),
      signal: sl.value.join(),
    },
    toggle: {
      name: "toggle-group",
      value: (
        <>
          value: <b>{JSON.stringify(tg.value)}</b>
        </>
      ),
      attr: (
        <>
          [data-state="on"] <b>{tg.value[0] ?? "none"}</b>
        </>
      ),
      signal: tg.value.join(),
    },
    checkbox: {
      name: "checkbox",
      value: (
        <>
          checked: <b>{JSON.stringify(cb.checkedState)}</b>
        </>
      ),
      attr: (
        <>
          data-state=<b>"{cbState}"</b>
        </>
      ),
      signal: String(cb.checkedState),
    },
  }

  const widths: Partial<Record<Key, number>> = { slider: 300 }

  return (
    <div className="zdesk">
      <style>{style}</style>
      <div
        ref={wrapRef}
        className="zdesk-canvas"
        style={compact ? undefined : { height: H * scale }}
      >
        {compact ? (
          <div className="zd-compact" ref={stageRef}>
            {keys.map((k) => (
              <div key={k} className="zd-row">
                <Obj id={k} active={false} width={widths[k]} onEnter={() => {}}>
                  {objects[k]}
                </Obj>
                <Tag id={k} {...tags[k]} onFlash={onFlash} />
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={stageRef}
            className="zd-stage"
            style={{ transform: `scale(${scale})` }}
          >
            <svg className="zd-lines" width={W} height={H} aria-hidden>
              {lines.map((l) => (
                <g key={l.id} data-flash={flashing[l.id] ? "" : undefined}>
                  <path d={l.d} />
                  <circle cx={l.dot.x} cy={l.dot.y} r="2.5" />
                </g>
              ))}
            </svg>
            {keys.map((k) => (
              <Obj
                key={k}
                id={k}
                active={active === k}
                width={widths[k]}
                onEnter={hover}
              >
                {objects[k]}
              </Obj>
            ))}
            {keys.map((k) => (
              <Tag key={k} id={k} {...tags[k]} onFlash={onFlash} />
            ))}
            <div ref={curRef} className="zd-cur" aria-hidden>
              <i />
              <svg viewBox="0 0 22 26">
                <path d="M3 2 L3 20.5 L7.6 16.4 L10.6 23.2 L13.6 21.9 L10.7 15.2 L16.8 15.2 Z" />
              </svg>
            </div>
          </div>
        )}
      </div>
      <div className="zd-foot">
        <span>
          <b>5</b> machines · <b>0</b> kb css · real DOM
        </span>
        <span className="zd-live">
          {ghost && !compact
            ? "autoplay · move in to take over"
            : "live · your turn"}
        </span>
      </div>
    </div>
  )
}
