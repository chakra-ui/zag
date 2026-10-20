const style = `
.zart { --l: rgba(255,255,255,.22); --l2: rgba(255,255,255,.4); --t: rgba(255,255,255,.55); --tb: rgba(255,255,255,.9); --f: #1c1c1f; --a: #48bb78; --as: rgba(72,187,120,.12); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
html:not(.dark) .zart { --l: rgba(0,0,0,.18); --l2: rgba(0,0,0,.35); --t: rgba(0,0,0,.5); --tb: rgba(0,0,0,.85); --f: #ffffff; --a: #2f855a; --as: rgba(47,133,90,.1); }
.zart text { fill: var(--t); font-size: 10px; }
.zart .tb { fill: var(--tb); }
.zart .ta { fill: var(--a); }
@keyframes zart-dash { to { stroke-dashoffset: -24 } }
@keyframes zart-hop { 0%, 22% { transform: translateY(0) } 33%, 55% { transform: translateY(28px) } 66%, 88% { transform: translateY(56px) } 100% { transform: translateY(0) } }
@keyframes zart-blink { 0%, 100% { opacity: 1 } 50% { opacity: .35 } }
.zart .flow { stroke-dasharray: 3 5; animation: zart-dash 1.2s linear infinite }
.zart .hop { animation: zart-hop 4.5s cubic-bezier(.6,0,.2,1) infinite }
.zart .blink { animation: zart-blink 2.4s ease-in-out infinite }
@media (prefers-reduced-motion: reduce) { .zart .flow, .zart .hop, .zart .blink { animation: none } }
`

function Svg(props: {
  label: string
  w?: number
  h?: number
  children: React.ReactNode
}) {
  const { w = 280, h = 180 } = props
  return (
    <svg
      className="zart"
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      aria-label={props.label}
    >
      <style>{style}</style>
      {props.children}
    </svg>
  )
}

export function ArtStatechart() {
  const node = (x: number, y: number, label: string, active?: boolean) => (
    <g>
      <rect
        x={x}
        y={y}
        width="76"
        height="28"
        rx="14"
        fill={active ? "var(--as)" : "var(--f)"}
        stroke={active ? "var(--a)" : "var(--l2)"}
      />
      <text
        x={x + 38}
        y={y + 18}
        textAnchor="middle"
        className={active ? "ta" : "tb"}
      >
        {label}
      </text>
    </g>
  )
  return (
    <Svg label="Statechart with idle, open and closed states">
      <circle cx="30" cy="48" r="4" fill="var(--l2)" />
      <path d="M34 48 H52" stroke="var(--l2)" />
      {node(52, 34, "idle")}
      <path className="flow" d="M128 48 H170" stroke="var(--a)" fill="none" />
      <text x="149" y="40" textAnchor="middle">
        OPEN
      </text>
      {node(170, 34, "open", true)}
      <path d="M208 62 V112 H128" stroke="var(--l2)" fill="none" />
      <text x="214" y="92">
        CLOSE
      </text>
      {node(52, 98, "closed")}
      <path d="M90 98 V62" stroke="var(--l2)" fill="none" />
      <text x="96" y="84">
        RESET
      </text>
      <text x="20" y="160">
        no impossible states
      </text>
    </Svg>
  )
}

export function ArtAnatomy() {
  const callout = (
    x1: number,
    y1: number,
    x2: number,
    label: string,
    accent?: boolean,
  ) => (
    <g>
      <path
        d={`M${x1} ${y1} H${x2}`}
        stroke={accent ? "var(--a)" : "var(--l2)"}
        strokeDasharray="2 3"
      />
      <circle cx={x1} cy={y1} r="2" fill={accent ? "var(--a)" : "var(--l2)"} />
      <text x={x2 + 6} y={y1 + 3} className={accent ? "ta" : undefined}>
        {label}
      </text>
    </g>
  )
  return (
    <Svg label="A menu split into its parts: trigger, content and items">
      <rect
        x="24"
        y="20"
        width="96"
        height="26"
        rx="5"
        fill="var(--f)"
        stroke="var(--l2)"
      />
      <text x="36" y="37" className="tb">
        Actions ▾
      </text>
      <rect
        x="24"
        y="54"
        width="120"
        height="104"
        rx="6"
        fill="var(--f)"
        stroke="var(--l2)"
      />
      {["Edit", "Duplicate", "Archive", "Delete"].map((item, i) => (
        <g key={item}>
          {i === 1 && (
            <rect
              x="30"
              y={60 + i * 24}
              width="108"
              height="22"
              rx="4"
              fill="var(--as)"
            />
          )}
          <text x="40" y={75 + i * 24} className={i === 1 ? "ta" : "tb"}>
            {item}
          </text>
        </g>
      ))}
      {callout(120, 33, 168, "data-menu-trigger")}
      {callout(144, 62, 168, "data-menu-content")}
      {callout(138, 95, 168, "data-highlighted", true)}
      {callout(144, 143, 168, "data-menu-item")}
    </Svg>
  )
}

export function ArtKeyboard() {
  const key = (x: number, y: number, label: string, w = 30) => (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height="26"
        rx="5"
        fill="var(--f)"
        stroke="var(--l2)"
      />
      <rect x={x} y={y + 22} width={w} height="4" rx="2" fill="var(--l)" />
      <text x={x + w / 2} y={y + 16} textAnchor="middle" className="tb">
        {label}
      </text>
    </g>
  )
  return (
    <Svg label="Arrow keys move focus between items">
      {["Inbox", "Drafts", "Sent"].map((item, i) => (
        <g key={item}>
          <rect
            x="24"
            y={24 + i * 28}
            width="120"
            height="24"
            rx="4"
            fill="var(--f)"
            stroke="var(--l)"
          />
          <text x="36" y={40 + i * 28} className="tb">
            {item}
          </text>
        </g>
      ))}
      <g className="hop">
        <rect
          x="21"
          y="21"
          width="126"
          height="30"
          rx="6"
          fill="none"
          stroke="var(--a)"
          strokeWidth="1.5"
        />
      </g>
      {key(178, 24, "↑")}
      {key(178, 56, "↓")}
      {key(214, 56, "esc", 42)}
      {key(214, 24, "↵", 42)}
      <text x="24" y="130">
        aria-activedescendant
      </text>
      <text x="24" y="146" className="ta">
        roving focus, typeahead
      </text>
    </Svg>
  )
}

export function ArtAdapters() {
  const outs = ["react", "vue", "solid", "svelte", "preact"]
  return (
    <Svg label="One machine connects to five framework adapters">
      <rect
        x="20"
        y="64"
        width="84"
        height="52"
        rx="8"
        fill="var(--as)"
        stroke="var(--a)"
      />
      <text x="62" y="86" textAnchor="middle" className="ta">
        machine
      </text>
      <text x="62" y="102" textAnchor="middle">
        connect()
      </text>
      {outs.map((name, i) => {
        const y = 22 + i * 32
        return (
          <g key={name}>
            <path
              className="flow"
              d={`M104 90 C 140 90, 140 ${y + 12}, 176 ${y + 12}`}
              stroke="var(--l2)"
              fill="none"
            />
            <rect
              x="176"
              y={y}
              width="84"
              height="24"
              rx="12"
              fill="var(--f)"
              stroke="var(--l2)"
            />
            <text x="218" y={y + 16} textAnchor="middle" className="tb">
              {name}
            </text>
          </g>
        )
      })}
    </Svg>
  )
}

export function ArtHeadless() {
  return (
    <Svg label="The same switch, unstyled and styled">
      <text x="24" y="30">
        unstyled
      </text>
      <rect
        x="24"
        y="40"
        width="96"
        height="40"
        rx="4"
        fill="none"
        stroke="var(--l2)"
        strokeDasharray="3 3"
      />
      <rect
        x="36"
        y="52"
        width="34"
        height="16"
        rx="2"
        fill="none"
        stroke="var(--l2)"
        strokeDasharray="3 3"
      />
      <text x="76" y="64">
        label
      </text>
      <path d="M128 60 H152" stroke="var(--l2)" />
      <path d="M148 56 L152 60 L148 64" stroke="var(--l2)" fill="none" />
      <text x="160" y="30">
        your css
      </text>
      <rect
        x="160"
        y="40"
        width="96"
        height="40"
        rx="8"
        fill="var(--f)"
        stroke="var(--l2)"
      />
      <rect x="172" y="52" width="32" height="16" rx="8" fill="var(--a)" />
      <circle cx="196" cy="60" r="6" fill="var(--f)" />
      <text x="212" y="64" className="tb">
        Wi-Fi
      </text>
      <text x="24" y="120">
        [data-state="checked"]
      </text>
      <text x="24" y="136" className="ta">
        0 kb of css shipped
      </text>
    </Svg>
  )
}

export function ArtZig(props: { width?: number }) {
  return (
    <svg
      className="zart"
      viewBox="0 0 400 24"
      width={props.width ?? "100%"}
      aria-hidden
    >
      <style>{style}</style>
      <path
        className="blink"
        d="M0 18 L40 6 L28 18 L72 6 L60 18 L104 6"
        stroke="var(--a)"
        strokeWidth="2"
        fill="none"
      />
      <path d="M104 12 H400" stroke="var(--l)" strokeDasharray="2 4" />
    </svg>
  )
}

export const pillarArt = [ArtStatechart, ArtKeyboard, ArtAdapters, ArtHeadless]
