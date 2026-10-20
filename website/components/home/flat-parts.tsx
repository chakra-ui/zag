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

const AD_LIVE = 1600
const AD_STEP = 1300
const fws = [
  { name: "React", pkg: "@zag-js/react", cx: 110, top: true },
  { name: "Vue", pkg: "@zag-js/vue", cx: 320, top: true },
  { name: "Solid", pkg: "@zag-js/solid", cx: 530, top: true },
  { name: "Svelte", pkg: "@zag-js/svelte", cx: 215, top: false },
  { name: "Preact", pkg: "@zag-js/preact", cx: 425, top: false },
].map((f) => ({
  ...f,
  y: f.top ? 45 : 345,
  route: (f.top
    ? [
        [320, 186],
        [320, 140],
        [f.cx, 140],
        [f.cx, 97],
      ]
    : [
        [320, 254],
        [320, 300],
        [f.cx, 300],
        [f.cx, 343],
      ]) as P[],
}))

export function FlatAdapters() {
  const [t, ref] = useClock<SVGSVGElement>(AD_LIVE + AD_STEP + 1000)
  const { draw, fade, hand } = intro(t)
  const live = t >= AD_LIVE
  const n = live ? Math.floor((t - AD_LIVE) / AD_STEP) % fws.length : -1
  const local = live ? (t - AD_LIVE) % AD_STEP : 0
  const go = ease(ramp(local, 0, 700))
  const arrived = live && local >= 700

  return (
    <Sheet
      cls="zfd"
      svgRef={ref}
      label="One menu machine in the middle, wired out to five framework boxes: React, Vue, Solid, Svelte and Preact. A small packet travels from the machine to each framework in turn, the same behavior reaching every one."
    >
      <Guide
        pts={[
          [320, 0],
          [320, 440],
        ]}
        p={draw}
      />
      {[140, 300].map((y) => (
        <Guide
          key={y}
          pts={[
            [0, y],
            [640, y],
          ]}
          p={draw}
          style={{ opacity: 0.6 }}
        />
      ))}

      {fws.map((f, i) => (
        <Wire
          key={f.name}
          pts={f.route}
          p={draw}
          head
          on={live && n === i}
          style={{ opacity: draw }}
        />
      ))}
      <g style={{ opacity: hand }}>
        <Handle at={[320, 140]} s={4} />
        <Handle at={[320, 300]} s={4} />
      </g>

      <Rect
        x={240}
        y={186}
        w={160}
        h={68}
        r={10}
        draw={draw}
        stroke="var(--a)"
        fill="var(--hf)"
        width={1.4}
      />
      <g style={{ opacity: fade }}>
        <text x={320} y={216} textAnchor="middle" className="a lg">
          menu machine
        </text>
        <text x={320} y={236} textAnchor="middle" className="sm">
          @zag-js/menu
        </text>
        <text x={228} y={224} textAnchor="end">
          written once
        </text>
        <text x={412} y={224}>
          used everywhere
        </text>
      </g>
      <Corners x={240} y={186} w={160} h={68} o={hand} on />

      {fws.map((f, i) => {
        const on = arrived && n === i
        const x = f.cx - 62
        return (
          <g key={f.name}>
            <Rect
              x={x}
              y={f.y}
              w={124}
              h={52}
              r={8}
              draw={draw}
              stroke={on ? "var(--a)" : "var(--l3)"}
              fill={on ? "var(--as)" : "var(--hf)"}
            />
            <g style={{ opacity: fade }}>
              <text
                x={f.cx}
                y={f.y + 24}
                textAnchor="middle"
                className={on ? "a lg" : "b lg"}
              >
                {f.name}
              </text>
              <text x={f.cx} y={f.y + 40} textAnchor="middle" className="sm">
                {f.pkg}
              </text>
            </g>
            <Corners x={x} y={f.y} w={124} h={52} o={hand} on={on} />
          </g>
        )
      })}

      {live && local < 700 && <Packet at={tip(fws[n].route, go)} />}

      <g style={{ opacity: hand }}>
        <text x={320} y={428} textAnchor="middle">
          same behavior in{" "}
          <tspan className="a">{live ? fws[n].name : "every framework"}</tspan>
        </text>
      </g>
    </Sheet>
  )
}

const AY_LIVE = 1600
const AY_LOOP = 7000
type R = [number, number, number, number]
const targets: Record<string, R> = {
  close: [446, 146, 24, 24],
  cancel: [254, 300, 100, 36],
  del: [364, 300, 102, 36],
  trigger: [44, 76, 140, 34],
}
const names: Record<string, string> = {
  close: "Close",
  cancel: "Cancel",
  del: "Delete",
  trigger: "Delete file",
}
const focusSteps: [number, string][] = [
  [0, "close"],
  [1100, "cancel"],
  [2200, "del"],
  [3300, "close"],
  [4500, "trigger"],
  [6700, "close"],
]
const tabs = [1100, 2200, 3300]

function focusAt(local: number) {
  let i = 0
  for (let j = 0; j < focusSteps.length; j++)
    if (local >= focusSteps[j][0]) i = j
  const [at, id] = focusSteps[i]
  const from = i === 0 ? id : focusSteps[i - 1][1]
  return {
    to: targets[id],
    id,
    k: from === id ? 1 : ease(ramp(local, at, 180)),
  }
}

export function FlatA11y() {
  const [t, ref] = useClock<SVGSVGElement>(AY_LIVE + 1500)
  const { draw, fade, hand } = intro(t)
  const live = t >= AY_LIVE
  const local = live ? (t - AY_LIVE) % AY_LOOP : 0
  const f = focusAt(local)
  const ring = f.to
  const pad = lerp(9, 4, f.k)
  const open = live ? 1 - ramp(local, 4400, 300) + ramp(local, 6400, 300) : 1
  const tab = live && tabs.some((a) => local >= a && local < a + 320)
  const esc = live && local >= 4400 && local < 4720
  const wrap = live && local >= 3200 && local < 4300
  const back = live && local >= 4600 && local < 6400
  const ringO = live ? f.k : ramp(t, AY_LIVE - 400, 400)
  const hint = esc
    ? "Esc closes it"
    : back
      ? "focus goes back"
      : tab
        ? "Tab moves focus"
        : "keys"

  return (
    <Sheet
      cls="zfy"
      svgRef={ref}
      label="A dialog open over a page. A focus ring steps between its buttons as Tab is pressed and loops from the last button back to the first. Esc closes the dialog and focus returns to the button that opened it."
    >
      <Rect
        x={20}
        y={20}
        w={600}
        h={400}
        r={8}
        draw={draw}
        stroke="var(--l2)"
      />
      <g style={{ opacity: fade }}>
        <polyline
          points="20,56 620,56"
          fill="none"
          stroke="var(--l)"
          strokeWidth={1}
        />
        <rect x={36} y={32} width={14} height={14} rx={3} fill="var(--l2)" />
        {[480, 530, 580].map((x) => (
          <rect
            key={x}
            x={x - 20}
            y={36}
            width={36}
            height={6}
            rx={3}
            fill="var(--l)"
          />
        ))}
        {[140, 160, 180, 220, 240, 260].map((y, i) => (
          <rect
            key={y}
            x={44}
            y={y}
            width={i % 3 === 2 ? 320 : 520}
            height={6}
            rx={3}
            fill="var(--l)"
          />
        ))}
      </g>
      <Rect x={44} y={76} w={140} h={34} r={6} draw={draw} stroke="var(--l3)" />
      <text
        x={114}
        y={97}
        textAnchor="middle"
        className="b"
        style={{ opacity: fade }}
      >
        Delete file
      </text>

      <g style={{ opacity: open * fade }}>
        <rect x={20} y={20} width={600} height={400} rx={8} fill="var(--dim)" />
        <Rect
          x={170}
          y={130}
          w={320}
          h={230}
          r={10}
          stroke="var(--l3)"
          fill="var(--hf)"
        />
        <text x={194} y={168} className="b lg">
          Delete this file?
        </text>
        <text x={194} y={194}>
          You can&apos;t undo this.
        </text>
        <Rect x={194} y={222} w={272} h={48} r={6} stroke="var(--l)" />
        <Rect x={206} y={232} w={22} h={28} r={3} stroke="var(--l2)" />
        <text x={240} y={244} className="b">
          report.pdf
        </text>
        <text x={240} y={261} className="sm">
          2.4 MB
        </text>
        <Rect x={446} y={146} w={24} h={24} r={5} stroke="var(--l2)" />
        <path
          d="M453 153 L463 163 M463 153 L453 163"
          stroke="var(--l3)"
          strokeWidth={1.2}
        />
        <Rect x={254} y={300} w={100} h={36} r={6} stroke="var(--l3)" />
        <text x={304} y={323} textAnchor="middle" className="b">
          Cancel
        </text>
        <Rect
          x={364}
          y={300}
          w={102}
          h={36}
          r={6}
          stroke="var(--l3)"
          fill="var(--grid)"
        />
        <text x={415} y={323} textAnchor="middle" className="b">
          Delete
        </text>
        <Corners x={170} y={130} w={320} h={230} o={hand} />
        <path
          d="M472 318 C540 318 540 158 478 158"
          fill="none"
          stroke={wrap ? "var(--a)" : "var(--k)"}
          strokeDasharray="2 3"
        />
        <polygon
          points="476,158 484,154 484,162"
          fill={wrap ? "var(--a)" : "var(--l3)"}
        />
        <text x={532} y={236} className={wrap ? "a" : undefined}>
          Tab loops
        </text>
        <text x={532} y={252} className={wrap ? "a" : undefined}>
          back
        </text>
      </g>

      <g style={{ opacity: back ? ramp(local, 4600, 250) : 0 }}>
        <Wire
          pts={[
            [330, 93],
            [194, 93],
          ]}
          head
          on
        />
        <text x={338} y={97} className="a">
          focus returns here
        </text>
      </g>

      <rect
        x={ring[0] - pad}
        y={ring[1] - pad}
        width={ring[2] + pad * 2}
        height={ring[3] + pad * 2}
        rx={8}
        fill="none"
        stroke="var(--a)"
        strokeWidth={2}
        style={{ opacity: ringO }}
      />

      <g style={{ opacity: hand }}>
        <Keycap
          x={44}
          y={372}
          w={52}
          h={34}
          label="Tab"
          on={tab}
          press={tab ? 1 : 0}
          size={11}
        />
        <Keycap
          x={104}
          y={372}
          w={52}
          h={34}
          label="Esc"
          on={esc}
          press={esc ? 1 : 0}
          size={11}
        />
        <text x={170} y={392} className={tab || esc || back ? "a" : undefined}>
          {hint}
        </text>
        <text x={596} y={392} textAnchor="end">
          focus <tspan className="a">{live ? names[f.id] : "Close"}</tspan>
        </text>
      </g>
    </Sheet>
  )
}

const ST_LIVE = 1600
const ST_LOOP = 3200
const rules: { sel: string; decl: string; when?: boolean }[] = [
  { sel: "[data-switch-control]", decl: " { border-radius: 99px }" },
  {
    sel: '[data-switch-control][data-state="checked"]',
    decl: " { background: green }",
    when: true,
  },
  { sel: "[data-switch-thumb]", decl: " { border-radius: 50% }" },
  {
    sel: '[data-switch-thumb][data-state="checked"]',
    decl: " { translate: 40px }",
    when: true,
  },
]

export function FlatStyling() {
  const [t, ref] = useClock<SVGSVGElement>(ST_LIVE + 800)
  const { draw, fade, hand } = intro(t)
  const live = t >= ST_LIVE
  const local = live ? (t - ST_LIVE) % ST_LOOP : 0
  const checked = live ? local < ST_LOOP / 2 : false
  const edge = live ? (checked ? local : local - ST_LOOP / 2) : 9999
  const slide = ease(ramp(edge, 0, 220))
  const k = checked ? slide : 1 - slide
  const ringK = ramp(edge, 0, 500)
  const value = checked ? '"checked"' : '"unchecked"'

  return (
    <Sheet
      cls="zfs"
      svgRef={ref}
      label="The same switch drawn twice: an unstyled wireframe on the left and a styled switch on the right. Below, a short stylesheet targets data-switch-control and data-switch-thumb, and the rules for data-state checked light up when the switch turns on."
    >
      {[30, 330].map((x, i) => (
        <g key={x}>
          <Rect
            x={x}
            y={30}
            w={280}
            h={210}
            r={8}
            draw={draw}
            stroke="var(--l)"
          />
          <text x={x + 16} y={54} className="sm" style={{ opacity: fade }}>
            {i === 0 ? "no CSS" : "with your CSS"}
          </text>
        </g>
      ))}
      <Guide
        pts={[
          [0, 136],
          [640, 136],
        ]}
        p={draw}
        style={{ opacity: 0.7 }}
      />

      <Rect
        x={98}
        y={120}
        w={72}
        h={32}
        draw={draw}
        stroke="var(--l3)"
        fill="var(--hf)"
      />
      <rect
        x={checked ? 142 : 102}
        y={124}
        width={24}
        height={24}
        fill="none"
        stroke="var(--l3)"
        style={{ opacity: fade }}
      />
      <text x={184} y={141} className="b" style={{ opacity: fade }}>
        Wi-Fi
      </text>
      <Corners x={98} y={120} w={72} h={32} o={hand} />

      <g style={{ opacity: fade }}>
        <rect x={398} y={120} width={72} height={32} rx={16} fill="var(--l2)" />
        <rect
          x={398}
          y={120}
          width={72}
          height={32}
          rx={16}
          fill="var(--a)"
          style={{ opacity: k }}
        />
        <circle
          cx={lerp(414, 454, k)}
          cy={136}
          r={12}
          fill="var(--th)"
          stroke="var(--l2)"
          strokeWidth={0.6}
        />
        <text x={484} y={141} className="b lg">
          Wi-Fi
        </text>
        {live && edge < 500 && (
          <circle
            cx={434}
            cy={136}
            r={lerp(6, 28, ringK)}
            fill="none"
            stroke="var(--a)"
            style={{ opacity: 1 - ringK }}
          />
        )}
      </g>

      <g style={{ opacity: hand }} stroke="var(--k)" fill="none">
        <polyline points="414,124 414,96" strokeDasharray="1 3" />
        <polyline points="454,124 454,96" strokeDasharray="1 3" />
        <polyline points="414,102 454,102" />
        <polyline points="414,98 414,106" />
        <polyline points="454,98 454,106" />
      </g>
      <text
        x={434}
        y={92}
        textAnchor="middle"
        className="sm"
        style={{ opacity: hand }}
      >
        40px
      </text>

      {[170, 470].map((cx) => (
        <text
          key={cx}
          x={cx}
          y={206}
          textAnchor="middle"
          style={{ opacity: fade }}
        >
          data-state=<tspan className={checked ? "a" : "b"}>{value}</tspan>
        </text>
      ))}

      <Rect
        x={30}
        y={266}
        w={580}
        h={154}
        r={8}
        draw={draw}
        stroke="var(--l2)"
        fill="var(--hf)"
      />
      <text x={46} y={290} className="sm" style={{ opacity: fade }}>
        styles.css
      </text>
      <g style={{ opacity: hand }}>
        {rules.map((r, i) => {
          const on = r.when ? checked : true
          const y = 320 + i * 26
          return (
            <g key={r.sel} style={{ opacity: on ? 1 : 0.45 }}>
              <Handle at={[46, y - 4]} s={5} on={!!r.when && on} />
              <text x={60} y={y}>
                <tspan className={r.when && on ? "a" : "b"}>{r.sel}</tspan>
                {r.decl}
              </text>
            </g>
          )
        })}
      </g>
    </Sheet>
  )
}
