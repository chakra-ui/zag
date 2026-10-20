"use client"

import {
  Corners,
  Guide,
  Handle,
  Keycap,
  Packet,
  Rect,
  Sheet,
  Wire,
  ease,
  lerp,
  ramp,
  tip,
  useClock,
  type P,
} from "./flat-kit"

const intro = (t: number) => ({
  draw: ease(ramp(t, 0, 1200)),
  fade: ramp(t, 500, 700),
  hand: ramp(t, 900, 600),
})

const PR_LIVE = 1800
const PR_CYCLE = 3800
const upRoute: P[] = [
  [96, 357],
  [44, 357],
  [44, 82],
  [72, 82],
]
const down1: P[] = [
  [252, 134],
  [252, 172],
]
const down2: P[] = [
  [252, 268],
  [252, 306],
]
const panels = [
  {
    y: 30,
    h: 104,
    name: "behavior (Zag)",
    note: "what happens when",
  },
  { y: 172, h: 96, name: "props", note: "attributes + handlers" },
  { y: 306, h: 104, name: "your markup + CSS", note: "how it looks" },
]

export function FlatPrinciples() {
  const [t, ref] = useClock<SVGSVGElement>(PR_LIVE + 2600)
  const { draw, fade, hand } = intro(t)
  const live = t >= PR_LIVE
  const after = Math.max(t - PR_LIVE, 0)
  const cycle = Math.floor(after / PR_CYCLE)
  const local = live ? after % PR_CYCLE : -1
  const cur = live ? cycle % 2 === 0 : false
  const prev = live ? !cur : false
  const s1 = local >= 750 ? cur : prev
  const s2 = local >= 1100 ? cur : prev
  const s3 = local >= 1450 ? cur : prev
  const evt = cur ? "click" : "esc"
  const up = local >= 150 && local < 750
  const flash2 = local >= 1100 && local < 1900
  const pop = ease(ramp(local, 1450, 250))
  const open3 = s3 ? (local >= 1450 ? pop : 1) : local >= 1450 ? 1 - pop : 0
  const ring = ramp(local, 0, 500)
  const upAt = tip(upRoute, ease(ramp(local, 150, 600)))
  const d1 = tip(down1, ease(ramp(local, 750, 350)))
  const d2 = tip(down2, ease(ramp(local, 1100, 350)))
  const down = local >= 750 && local < 1450

  const stateBox = (x: number, label: string, on: boolean) => (
    <g>
      <Rect
        x={x}
        y={62}
        w={120}
        h={40}
        r={10}
        draw={draw}
        stroke={on ? "var(--a)" : "var(--l3)"}
        fill={on ? "var(--as)" : "none"}
      />
      <text
        x={x + 60}
        y={86}
        textAnchor="middle"
        className={on ? "a" : "b"}
        style={{ opacity: fade }}
      >
        {label}
      </text>
    </g>
  )

  const row = (y: number, k: string, v: string) => (
    <text x={96} y={y} style={{ opacity: fade }}>
      {k}
      <tspan className={flash2 ? "a" : "b"}>{v}</tspan>
    </text>
  )

  return (
    <Sheet
      cls="zfp"
      svgRef={ref}
      label="Three layers stacked top to bottom: behavior from Zag, the props it hands you, and your own markup and CSS. A click travels up to the behavior layer, which changes state and sends new props down to your markup."
    >
      <g style={{ opacity: draw }}>
        <Guide
          pts={[
            [252, 0],
            [252, 440],
          ]}
          p={draw}
        />
      </g>

      {panels.map((p, i) => (
        <g key={p.name}>
          <Rect
            x={72}
            y={p.y}
            w={360}
            h={p.h}
            r={8}
            draw={draw}
            stroke={i === 0 ? "var(--a)" : "var(--l2)"}
            fill="var(--hf)"
          />
          <text x={84} y={p.y + 16} className="sm" style={{ opacity: fade }}>
            0{i + 1}
          </text>
          <Guide
            pts={[
              [432, p.y + p.h / 2],
              [456, p.y + p.h / 2],
            ]}
            p={hand}
          />
          <g style={{ opacity: hand }}>
            <Handle at={[432, p.y + p.h / 2]} s={4} on={i === 0} />
            <text
              x={462}
              y={p.y + p.h / 2 - 4}
              className={i === 0 ? "a lg" : "b lg"}
            >
              {p.name}
            </text>
            <text x={462} y={p.y + p.h / 2 + 14}>
              {p.note}
            </text>
          </g>
          <Corners x={72} y={p.y} w={360} h={p.h} o={hand} />
        </g>
      ))}

      {stateBox(102, "closed", !s1)}
      {stateBox(282, "open", s1)}
      <g style={{ opacity: fade }}>
        <Wire
          pts={[
            [224, 76],
            [280, 76],
          ]}
          head
          on={live && cur && local >= 600 && local < 1100}
        />
        <Wire
          pts={[
            [280, 90],
            [224, 90],
          ]}
          head
          on={live && !cur && local >= 600 && local < 1100}
        />
      </g>

      {row(214, "aria-expanded=", s2 ? '"true"' : '"false"')}
      {row(234, "data-state=", s2 ? '"open"' : '"closed"')}
      <text x={96} y={254} style={{ opacity: fade }}>
        onClick, onKeyDown
      </text>

      <Rect
        x={96}
        y={340}
        w={120}
        h={34}
        r={6}
        draw={draw}
        stroke="var(--l3)"
      />
      <g style={{ opacity: fade }}>
        <text x={112} y={361} className="b">
          Menu
        </text>
        <polyline
          points={
            open3 > 0.5 ? "190,360 196,354 202,360" : "190,354 196,360 202,354"
          }
          fill="none"
          stroke="var(--l3)"
          strokeWidth={1.2}
        />
      </g>
      <g
        style={{
          opacity: open3,
          transform: `translateY(${lerp(-6, 0, open3)}px)`,
        }}
      >
        <Rect x={236} y={334} w={176} h={64} r={6} stroke="var(--l3)" />
        {[348, 364, 380].map((y, i) => (
          <rect
            key={y}
            x={250}
            y={y}
            width={i === 1 ? 96 : 124}
            height={6}
            rx={3}
            fill="var(--l)"
          />
        ))}
      </g>

      <g style={{ opacity: fade }}>
        <Wire pts={upRoute} dash="2 3" on={up} head />
        <Wire pts={down1} dash="2 3" on={local >= 750 && local < 1100} head />
        <Wire pts={down2} dash="2 3" on={local >= 1100 && local < 1450} head />
        <text
          transform="rotate(-90 34 220)"
          x={34}
          y={220}
          textAnchor="middle"
          className={up ? "a" : undefined}
        >
          {up ? `event: ${evt}` : "events go up"}
        </text>
      </g>

      {live && local < 600 && (
        <circle
          cx={156}
          cy={357}
          r={lerp(4, 22, ring)}
          fill="none"
          stroke="var(--a)"
          style={{ opacity: 1 - ring }}
        />
      )}
      {up && <Packet at={upAt} />}
      {down && <Packet at={local < 1100 ? d1 : d2} />}
    </Sheet>
  )
}

const MC_LIVE = 1600
const states = [
  { id: "closed", x: 70, y: 92, dash: undefined },
  { id: "opening", x: 420, y: 92, dash: "4 3" },
  { id: "open", x: 420, y: 292, dash: undefined },
  { id: "closing", x: 70, y: 292, dash: "4 3" },
]
const arrows: { pts: P[]; ev: string; lx: number; ly: number; a?: "end" }[] = [
  {
    pts: [
      [222, 120],
      [418, 120],
    ],
    ev: "click",
    lx: 320,
    ly: 110,
  },
  {
    pts: [
      [495, 150],
      [495, 290],
    ],
    ev: "done",
    lx: 507,
    ly: 224,
  },
  {
    pts: [
      [418, 320],
      [222, 320],
    ],
    ev: "esc",
    lx: 320,
    ly: 310,
  },
  {
    pts: [
      [145, 290],
      [145, 150],
    ],
    ev: "done",
    lx: 133,
    ly: 224,
    a: "end",
  },
]
const dwell = [900, 1600, 900, 1600]
const TRAVEL = 500
const MC_LOOP = dwell.reduce((s, d) => s + d + TRAVEL, 0)

function machineAt(local: number) {
  let at = 0
  for (let i = 0; i < 4; i++) {
    if (local < at + TRAVEL) return { active: i, k: (local - at) / TRAVEL, i }
    at += TRAVEL
    if (local < at + dwell[i]) return { active: (i + 1) % 4, k: -1, i }
    at += dwell[i]
  }
  return { active: 0, k: -1, i: 3 }
}

export function FlatMachines() {
  const [t, ref] = useClock<SVGSVGElement>(MC_LIVE + 2600)
  const { draw, fade, hand } = intro(t)
  const live = t >= MC_LIVE
  const local = (t - MC_LIVE) % MC_LOOP
  const m = live ? machineAt(local) : { active: 0, k: -1, i: 3 }
  const moving = m.k >= 0
  const cur = states[m.active]
  const ev = arrows[m.i].ev

  return (
    <Sheet
      cls="zfm"
      svgRef={ref}
      label="A state machine drawn as four boxes: closed, opening, open and closing. Arrows between them are labelled with the events that move it on, click, done and esc. A token steps around the loop and the current state is lit."
    >
      <g style={{ opacity: draw }}>
        {[120, 320].map((y) => (
          <Guide
            key={y}
            pts={[
              [0, y],
              [640, y],
            ]}
            p={draw}
          />
        ))}
        {[145, 495].map((x) => (
          <Guide
            key={x}
            pts={[
              [x, 40],
              [x, 400],
            ]}
            p={draw}
          />
        ))}
      </g>

      <g style={{ opacity: fade }}>
        <circle cx={26} cy={120} r={4} fill="var(--l3)" />
        <Wire
          pts={[
            [32, 120],
            [68, 120],
          ]}
          head
        />
        <text x={20} y={104} className="sm">
          start
        </text>
      </g>

      {states.map((s, i) => {
        const on = i === m.active
        return (
          <g key={s.id}>
            <Rect
              x={s.x}
              y={s.y}
              w={150}
              h={56}
              r={14}
              draw={draw}
              dash={s.dash}
              stroke={on ? "var(--a)" : "var(--l3)"}
              fill={on ? "var(--as)" : "var(--hf)"}
              width={on ? 1.4 : 1.1}
            />
            <text
              x={s.x + 75}
              y={s.y + 33}
              textAnchor="middle"
              className={on ? "a lg" : "b lg"}
              style={{ opacity: fade }}
            >
              {s.id}
            </text>
            <Corners x={s.x} y={s.y} w={150} h={56} o={hand} on={on} />
          </g>
        )
      })}

      {arrows.map((a, i) => {
        const on = live && m.i === i && moving
        const lit = live && m.i === i
        return (
          <g key={`${a.ev}${i}`} style={{ opacity: fade }}>
            <Wire pts={a.pts} head on={on} />
            <text
              x={a.lx}
              y={a.ly}
              textAnchor={a.a ?? (a.lx === 320 ? "middle" : "start")}
              className={lit ? "a" : "b"}
            >
              {a.ev}
            </text>
          </g>
        )
      })}

      <g style={{ opacity: fade }}>
        <text x={320} y={214} textAnchor="middle" className="b">
          always in
        </text>
        <text x={320} y={234} textAnchor="middle">
          exactly one state
        </text>
      </g>

      {moving && <Packet at={tip(arrows[m.i].pts, ease(m.k))} />}

      <g style={{ opacity: hand }}>
        <text x={20} y={420}>
          state <tspan className="a">&quot;{cur.id}&quot;</tspan>
        </text>
        <text x={620} y={420} textAnchor="end">
          last event <tspan className="b">{live ? ev : "none"}</tspan>
        </text>
      </g>
    </Sheet>
  )
}

const EV_LIVE = 1600
const EV_STEP = 1700
const keys = ["↓", "↓", "↓", "↑", "↑", "↑"]
const hl = [1, 2, 3, 2, 1, 0]
const items = ["New file", "Open", "Save", "Export"]
const a1: P[] = [
  [118, 110],
  [174, 110],
]
const a2: P[] = [
  [338, 110],
  [394, 110],
]
const a3: P[] = [
  [498, 166],
  [498, 230],
]

export function FlatEvents() {
  const [t, ref] = useClock<SVGSVGElement>(EV_LIVE + 1500)
  const { draw, fade, hand } = intro(t)
  const live = t >= EV_LIVE
  const after = Math.max(t - EV_LIVE, 0)
  const n = Math.floor(after / EV_STEP)
  const local = live ? after % EV_STEP : -1
  const k = n % 6
  const key = keys[k]
  const name = key === "↓" ? "ARROW_DOWN" : "ARROW_UP"
  const before = live ? (k === 0 ? (n === 0 ? 0 : hl[5]) : hl[k - 1]) : 0
  const target = live ? hl[k] : 0
  const press = local < 0 ? 0 : ramp(local, 0, 80) * (1 - ramp(local, 220, 120))
  const tagOn = local >= 120 && local < 700
  const machineOn = local >= 650 && local < 1300
  const value = local >= 650 ? target : before
  const move = ease(ramp(local, 900, 220))
  const row = live ? lerp(before, target, local >= 900 ? move : 0) : 0
  const pk =
    local >= 120 && local < 400
      ? tip(a1, ease(ramp(local, 120, 280)))
      : local >= 400 && local < 650
        ? tip(a2, ease(ramp(local, 400, 250)))
        : local >= 650 && local < 900
          ? tip(a3, ease(ramp(local, 650, 250)))
          : null
  const done = live ? (local >= 650 ? n + 1 : n) : 0
  const log = Array.from({ length: Math.min(done, 4) }, (_, i) => done - 1 - i)

  return (
    <Sheet
      cls="zfe"
      svgRef={ref}
      label="A key press turning into a state change: the down arrow key becomes a named event, ARROW_DOWN, the menu machine updates which item is highlighted, and the highlight moves in the menu. A log lists the events so far."
    >
      <g style={{ opacity: hand }}>
        <text x={78} y={44} textAnchor="middle">
          you press a key
        </text>
        <text x={256} y={44} textAnchor="middle">
          Zag names it
        </text>
        <text x={498} y={44} textAnchor="middle">
          state changes
        </text>
        <text x={510} y={204}>
          screen follows
        </text>
      </g>
      <Guide
        pts={[
          [0, 110],
          [640, 110],
        ]}
        p={draw}
        style={{ opacity: 0.7 }}
      />

      <g style={{ opacity: fade }}>
        <Keycap
          x={40}
          y={72}
          w={76}
          h={76}
          label={key}
          press={press}
          on={press > 0}
          size={26}
        />
      </g>
      <Corners x={40} y={72} w={76} h={76} o={hand} />

      <Rect
        x={176}
        y={92}
        w={160}
        h={36}
        r={18}
        draw={draw}
        stroke={tagOn ? "var(--a)" : "var(--l3)"}
        fill={tagOn ? "var(--as)" : "var(--hf)"}
      />
      <text
        x={256}
        y={115}
        textAnchor="middle"
        className={tagOn ? "a lg" : "b lg"}
        style={{ opacity: fade }}
      >
        {name}
      </text>

      <Rect
        x={396}
        y={56}
        w={204}
        h={108}
        r={10}
        draw={draw}
        stroke={machineOn ? "var(--a)" : "var(--l3)"}
        fill="var(--hf)"
      />
      <g style={{ opacity: fade }}>
        <text x={412} y={80} className="sm">
          menu machine
        </text>
        <text x={412} y={114}>
          highlighted
        </text>
        <text
          x={588}
          y={114}
          textAnchor="end"
          className={machineOn ? "a" : "b"}
        >
          &quot;{items[value]}&quot;
        </text>
        <text x={412} y={140}>
          open
        </text>
        <text x={588} y={140} textAnchor="end" className="b">
          true
        </text>
      </g>
      <Corners x={396} y={56} w={204} h={108} o={hand} on={machineOn} />

      <g style={{ opacity: fade }}>
        <Wire pts={a1} head on={pk !== null && local < 400} />
        <Wire pts={a2} head on={local >= 400 && local < 650} />
        <Wire pts={a3} head on={local >= 650 && local < 900} />
      </g>

      <Rect
        x={396}
        y={232}
        w={204}
        h={176}
        r={10}
        draw={draw}
        stroke="var(--l3)"
        fill="var(--hf)"
      />
      <rect
        x={404}
        y={lerp(242, 242 + 40 * 3, row / 3)}
        width={188}
        height={36}
        rx={6}
        fill="var(--as)"
        stroke="var(--a)"
        style={{ opacity: fade }}
      />
      <g style={{ opacity: fade }}>
        {items.map((it, i) => (
          <text
            key={it}
            x={420}
            y={265 + i * 40}
            className={Math.round(row) === i ? "a" : "b"}
          >
            {it}
          </text>
        ))}
      </g>
      <Corners x={396} y={232} w={204} h={176} o={hand} />

      <g style={{ opacity: hand }}>
        <text x={40} y={252} className="sm">
          events so far
        </text>
        <polyline
          points="40,262 340,262"
          fill="none"
          stroke="var(--l)"
          strokeWidth={1}
        />
        {log.length === 0 && (
          <text x={40} y={288}>
            waiting for a key…
          </text>
        )}
        {log.map((s, i) => {
          const kk = s % 6
          return (
            <g key={s} style={{ opacity: 1 - i * 0.22 }}>
              <text x={40} y={288 + i * 28} className={i === 0 ? "a" : "b"}>
                {keys[kk] === "↓" ? "ARROW_DOWN" : "ARROW_UP"}
              </text>
              <text x={176} y={288 + i * 28}>
                → &quot;{items[hl[kk]]}&quot;
              </text>
            </g>
          )
        })}
      </g>

      {pk && <Packet at={pk} />}
    </Sheet>
  )
}

const AN_LIVE = 2400
const AN_STEP = 1800
type Box = [number, number, number, number]
const itemRows: Box[] = [
  [238, 120, 164, 36],
  [238, 160, 164, 36],
  [238, 214, 164, 36],
  [238, 254, 164, 36],
]
const parts: {
  name: string
  side: "l" | "r"
  y: number
  from: number
  boxes: Box[]
}[] = [
  { name: "trigger", side: "l", y: 76, from: 230, boxes: [[230, 56, 130, 40]] },
  {
    name: "indicator",
    side: "r",
    y: 76,
    from: 348,
    boxes: [[332, 69, 16, 14]],
  },
  {
    name: "content",
    side: "r",
    y: 140,
    from: 410,
    boxes: [[230, 112, 180, 188]],
  },
  { name: "item", side: "l", y: 178, from: 238, boxes: itemRows },
  {
    name: "separator",
    side: "r",
    y: 205,
    from: 398,
    boxes: [[242, 203, 156, 4]],
  },
]
const labels = ["Edit", "Duplicate", "Archive", "Delete"]

export function FlatAnatomy() {
  const [t, ref] = useClock<SVGSVGElement>(AN_LIVE + 3 * AN_STEP + 900)
  const { draw, fade } = intro(t)
  const live = t >= AN_LIVE
  const sel = live ? Math.floor((t - AN_LIVE) / AN_STEP) % parts.length : -1
  const local = live ? (t - AN_LIVE) % AN_STEP : 0
  const pick = live ? ease(ramp(local, 0, 260)) : 0
  const cur = sel >= 0 ? parts[sel] : null

  return (
    <Sheet
      cls="zfn"
      svgRef={ref}
      label="A menu drawn as a wireframe with callouts naming its parts: trigger, indicator, content, item and separator. Each part carries its own attribute, such as data-menu-trigger or data-menu-item, and the drawing selects each part in turn."
    >
      <g style={{ opacity: draw }}>
        {[230, 410].map((x) => (
          <Guide
            key={x}
            pts={[
              [x, 20],
              [x, 380],
            ]}
            p={draw}
          />
        ))}
        <Guide
          pts={[
            [180, 300],
            [460, 300],
          ]}
          p={draw}
        />
      </g>

      <Rect
        x={230}
        y={56}
        w={130}
        h={40}
        r={6}
        draw={draw}
        stroke="var(--l3)"
        fill="var(--hf)"
      />
      <Rect
        x={230}
        y={112}
        w={180}
        h={188}
        r={8}
        draw={draw}
        stroke="var(--l3)"
        fill="var(--hf)"
      />
      <g style={{ opacity: fade }}>
        <text x={246} y={81} className="b">
          Actions
        </text>
        <polyline
          points="334,73 340,79 346,73"
          fill="none"
          stroke="var(--l3)"
          strokeWidth={1.2}
        />
        {itemRows.map((b, i) => (
          <g key={b[1]}>
            <Rect
              x={b[0]}
              y={b[1]}
              w={b[2]}
              h={b[3]}
              r={5}
              stroke="var(--l)"
              fill={i === 1 ? "var(--grid)" : "none"}
            />
            <text x={254} y={b[1] + 23} className="b">
              {labels[i]}
            </text>
          </g>
        ))}
        <polyline
          points="242,205 398,205"
          fill="none"
          stroke="var(--l2)"
          strokeWidth={1}
        />
      </g>

      {parts.map((p, i) => {
        const show = ramp(t, 1200 + i * 220, 400)
        const on = sel === i
        const end = p.side === "l" ? 182 : 470
        const tx = p.side === "l" ? 40 : 478
        return (
          <g key={p.name}>
            <Guide
              pts={[
                [p.from, p.y],
                [end, p.y],
              ]}
              p={show}
              stroke={on ? "var(--a)" : "var(--k)"}
            />
            <g style={{ opacity: show }}>
              <Handle at={[p.from, p.y]} s={4} on={on} />
              <text x={tx} y={p.y - 4} className={on ? "a lg" : "b lg"}>
                {p.name}
              </text>
              <text x={tx} y={p.y + 14}>
                data-menu-<tspan className={on ? "a" : "b"}>{p.name}</tspan>
              </text>
            </g>
          </g>
        )
      })}

      {cur && (
        <g style={{ opacity: pick }}>
          {cur.boxes.map((b) => {
            const pad = 4
            return (
              <g key={`${b[0]},${b[1]}`}>
                <Rect
                  x={b[0] - pad}
                  y={b[1] - pad}
                  w={b[2] + pad * 2}
                  h={b[3] + pad * 2}
                  stroke="var(--a)"
                  dash="3 3"
                />
                <Corners
                  x={b[0] - pad}
                  y={b[1] - pad}
                  w={b[2] + pad * 2}
                  h={b[3] + pad * 2}
                  on
                />
              </g>
            )
          })}
        </g>
      )}

      <g style={{ opacity: ramp(t, 2200, 400) }}>
        <text x={40} y={420}>
          selector{" "}
          <tspan className="b">[data-menu-{cur ? cur.name : "item"}]</tspan>
        </text>
        <text x={600} y={420} textAnchor="end">
          matches <tspan className="a">{cur ? cur.boxes.length : 4}</tspan>
        </text>
      </g>
    </Sheet>
  )
}
