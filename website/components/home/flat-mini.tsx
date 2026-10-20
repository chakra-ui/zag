"use client"

import type { ComponentType } from "react"
import type { DiagramKey } from "components/lab/guide-copy"
import { isoVars, isoVarsLight } from "components/lab/hero-iso-kit"

const css = `
.zfq { ${isoVars} --th: rgba(255,255,255,.92); display: block; overflow: visible }
html:not(.dark) .zfq { ${isoVarsLight} --th: #ffffff }
.zfq text { fill: currentColor; font-size: 11px }
.zfq .ln { stroke: currentColor; stroke-opacity: .7 }
@keyframes zfq-drop { 0%, 15% { transform: translateY(0); opacity: 0 } 25% { opacity: 1 } 60% { transform: translateY(33px); opacity: 1 } 70%, 100% { transform: translateY(33px); opacity: 0 } }
@keyframes zfq-on { 0%, 24% { opacity: 1 } 25%, 100% { opacity: 0 } }
@keyframes zfq-rows { 0%, 30% { transform: translateY(0) } 36%, 64% { transform: translateY(18px) } 70%, 100% { transform: translateY(36px) } }
@keyframes zfq-march { to { stroke-dashoffset: -10 } }
@keyframes zfq-ring { 0%, 45% { transform: translateX(0) } 50%, 95% { transform: translateX(36px) } 100% { transform: translateX(0) } }
@keyframes zfq-thumb { 0%, 45% { transform: translateX(20px) } 50%, 95% { transform: translateX(0) } 100% { transform: translateX(20px) } }
@keyframes zfq-fill { 0%, 45% { opacity: 1 } 50%, 95% { opacity: 0 } 100% { opacity: 1 } }
@keyframes zfq-pick { 0%, 100% { opacity: .35 } 50% { opacity: 1 } }
.zfq .zfq-drop { animation: zfq-drop 2.6s ease-in-out infinite }
.zfq .zfq-on { opacity: 0; animation: zfq-on 4.8s step-end infinite }
.zfq .zfq-rows { animation: zfq-rows 3.6s ease-in-out infinite }
.zfq .zfq-march { animation: zfq-march 1s linear infinite }
.zfq .zfq-ring { animation: zfq-ring 3.2s ease-in-out infinite }
.zfq .zfq-thumb { animation: zfq-thumb 3.2s ease-in-out infinite }
.zfq .zfq-fill { animation: zfq-fill 3.2s ease-in-out infinite }
.zfq .zfq-pick { animation: zfq-pick 2.4s ease-in-out infinite }
@media (prefers-reduced-motion: reduce) {
  .zfq * { animation: none !important }
  .zfq .zfq-on.zfq-still { opacity: 1 }
  .zfq .zfq-drop { opacity: 0 }
}
`

function H(props: { x: number; y: number; on?: boolean }) {
  return (
    <rect
      x={props.x - 1.5}
      y={props.y - 1.5}
      width={3}
      height={3}
      fill="var(--hf)"
      stroke={props.on ? "var(--a)" : "currentColor"}
      strokeWidth={0.8}
    />
  )
}

function Principles() {
  return (
    <g>
      {[10, 43, 76].map((y, i) => (
        <rect
          key={y}
          x={28}
          y={y}
          width={104}
          height={24}
          rx={3}
          fill={i === 0 ? "var(--as)" : "var(--hf)"}
          stroke={i === 0 ? "var(--a)" : "currentColor"}
          strokeOpacity={i === 0 ? 1 : 0.7}
        />
      ))}
      <rect
        x={38}
        y={19}
        width={22}
        height={7}
        rx={3.5}
        fill="none"
        stroke="var(--a)"
      />
      <rect
        x={70}
        y={19}
        width={22}
        height={7}
        rx={3.5}
        fill="none"
        stroke="var(--a)"
        strokeOpacity={0.5}
      />
      {[52, 58].map((y, i) => (
        <rect
          key={y}
          x={38}
          y={y}
          width={i ? 36 : 56}
          height={3}
          rx={1.5}
          fill="var(--l2)"
        />
      ))}
      <rect
        x={38}
        y={83}
        width={30}
        height={10}
        rx={2}
        fill="none"
        className="ln"
      />
      <g fill="none" stroke="var(--k)" strokeDasharray="1 2">
        <polyline points="80,34 80,43" />
        <polyline points="80,67 80,76" />
      </g>
      <circle cx={80} cy={38} r={2.5} fill="var(--a)" className="zfq-drop" />
      {[
        [28, 10],
        [132, 10],
        [28, 100],
        [132, 100],
      ].map(([x, y]) => (
        <H key={`${x},${y}`} x={x} y={y} />
      ))}
    </g>
  )
}

function Machines() {
  const boxes: [number, number][] = [
    [14, 14],
    [102, 14],
    [102, 74],
    [14, 74],
  ]
  return (
    <g>
      <g fill="none" className="ln">
        <polyline points="58,25 100,25" />
        <polyline points="124,36 124,72" />
        <polyline points="100,85 60,85" />
        <polyline points="36,72 36,38" />
      </g>
      <g className="ln" fill="currentColor" strokeOpacity={0}>
        <polygon points="100,25 95,22.5 95,27.5" opacity={0.7} />
        <polygon points="124,72 121.5,67 126.5,67" opacity={0.7} />
        <polygon points="60,85 65,82.5 65,87.5" opacity={0.7} />
        <polygon points="36,38 33.5,43 38.5,43" opacity={0.7} />
      </g>
      {boxes.map(([x, y], i) => (
        <g key={`${x},${y}`}>
          <rect
            x={x}
            y={y}
            width={44}
            height={22}
            rx={6}
            fill="var(--hf)"
            className="ln"
            strokeDasharray={i % 2 ? "3 2" : undefined}
          />
          <rect
            x={x}
            y={y}
            width={44}
            height={22}
            rx={6}
            fill="var(--as)"
            stroke="var(--a)"
            strokeWidth={1.3}
            className={`zfq-on${i === 2 ? " zfq-still" : ""}`}
            style={{ animationDelay: `${i * 1.2}s` }}
          />
        </g>
      ))}
    </g>
  )
}

function Events() {
  return (
    <g>
      <rect
        x={8}
        y={36}
        width={36}
        height={36}
        rx={5}
        fill="none"
        className="ln"
      />
      <rect
        x={12}
        y={39}
        width={28}
        height={26}
        rx={4}
        fill="none"
        className="ln"
        strokeOpacity={0.4}
      />
      <text
        x={26}
        y={56}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: 15 }}
      >
        ↓
      </text>
      <g fill="none" stroke="var(--a)">
        <polyline points="46,54 62,54" />
        <polyline points="58,51 62,54 58,57" />
      </g>
      <rect
        x={64}
        y={47}
        width={28}
        height={14}
        rx={7}
        fill="var(--as)"
        stroke="var(--a)"
      />
      <g fill="none" className="ln">
        <polyline points="94,54 104,54" />
        <polyline points="100,51 104,54 100,57" />
      </g>
      <rect
        x={106}
        y={20}
        width={46}
        height={70}
        rx={4}
        fill="var(--hf)"
        className="ln"
      />
      <g className="zfq-rows">
        <rect
          x={109}
          y={24}
          width={40}
          height={14}
          rx={3}
          fill="var(--as)"
          stroke="var(--a)"
        />
      </g>
      {[31, 49, 67, 85].map((y) => (
        <rect
          key={y}
          x={114}
          y={y - 2}
          width={24}
          height={3}
          rx={1.5}
          fill="var(--l2)"
        />
      ))}
    </g>
  )
}

function Anatomy() {
  return (
    <g>
      <rect
        x={54}
        y={10}
        width={52}
        height={16}
        rx={3}
        fill="var(--hf)"
        className="ln"
      />
      <polyline points="96,16 99,19 102,16" fill="none" className="ln" />
      <rect
        x={54}
        y={32}
        width={62}
        height={68}
        rx={4}
        fill="var(--hf)"
        className="ln"
      />
      {[38, 54, 74].map((y, i) => (
        <rect
          key={y}
          x={58}
          y={y}
          width={54}
          height={13}
          rx={2}
          fill={i === 1 ? "var(--as)" : "none"}
          stroke={i === 1 ? "var(--a)" : "var(--l2)"}
        />
      ))}
      <polyline points="58,70 112,70" stroke="var(--l2)" />
      <g fill="none" stroke="var(--k)" strokeDasharray="1 2">
        <polyline points="54,18 26,18" />
        <polyline points="58,60 26,60" />
        <polyline points="116,40 136,40" />
      </g>
      <polyline
        points="26,60 58,60"
        fill="none"
        stroke="var(--a)"
        strokeDasharray="1 2"
        className="zfq-pick"
      />
      {[
        [10, 18],
        [10, 60],
        [140, 40],
      ].map(([x, y], i) => (
        <rect
          key={y}
          x={x}
          y={y - 1.5}
          width={i === 2 ? 14 : 14}
          height={3}
          rx={1.5}
          fill={i === 1 ? "var(--a)" : "var(--l3)"}
        />
      ))}
      <H x={54} y={18} />
      <H x={58} y={60} on />
      <H x={116} y={40} />
    </g>
  )
}

function Adapters() {
  const top = [12, 62, 112]
  const bot = [37, 87]
  return (
    <g>
      <g
        fill="none"
        stroke="var(--a)"
        strokeOpacity={0.8}
        strokeDasharray="2 3"
        className="zfq-march"
      >
        <polyline points="80,44 80,34 30,34 30,25" />
        <polyline points="80,44 80,25" />
        <polyline points="80,44 80,34 130,34 130,25" />
        <polyline points="80,66 80,76 55,76 55,85" />
        <polyline points="80,66 80,76 105,76 105,85" />
      </g>
      <rect
        x={56}
        y={44}
        width={48}
        height={22}
        rx={4}
        fill="var(--as)"
        stroke="var(--a)"
        strokeWidth={1.3}
      />
      {top.map((x) => (
        <rect
          key={x}
          x={x}
          y={9}
          width={36}
          height={16}
          rx={3}
          fill="var(--hf)"
          className="ln"
        />
      ))}
      {bot.map((x) => (
        <rect
          key={x}
          x={x}
          y={85}
          width={36}
          height={16}
          rx={3}
          fill="var(--hf)"
          className="ln"
        />
      ))}
      {[...top.map((x) => [x, 17]), ...bot.map((x) => [x, 93])].map(
        ([x, y]) => (
          <rect
            key={`${x},${y}`}
            x={x + 8}
            y={y - 1.5}
            width={20}
            height={3}
            rx={1.5}
            fill="var(--l2)"
          />
        ),
      )}
    </g>
  )
}

function A11y() {
  return (
    <g>
      <rect
        x={8}
        y={8}
        width={144}
        height={94}
        rx={4}
        fill="none"
        stroke="var(--l2)"
      />
      <rect
        x={16}
        y={16}
        width={34}
        height={9}
        rx={2}
        fill="none"
        stroke="var(--l2)"
      />
      <rect x={8} y={8} width={144} height={94} rx={4} fill="var(--grid)" />
      <rect
        x={34}
        y={30}
        width={92}
        height={62}
        rx={5}
        fill="var(--hf)"
        className="ln"
      />
      <rect x={42} y={40} width={50} height={4} rx={2} fill="var(--l3)" />
      <rect x={42} y={49} width={36} height={3} rx={1.5} fill="var(--l2)" />
      <rect
        x={52}
        y={70}
        width={30}
        height={13}
        rx={3}
        fill="none"
        className="ln"
      />
      <rect
        x={88}
        y={70}
        width={30}
        height={13}
        rx={3}
        fill="none"
        className="ln"
      />
      <g className="zfq-ring">
        <rect
          x={49}
          y={67}
          width={36}
          height={19}
          rx={5}
          fill="none"
          stroke="var(--a)"
          strokeWidth={1.6}
        />
      </g>
    </g>
  )
}

function Styling() {
  return (
    <g>
      <polyline points="80,18 80,92" stroke="var(--k)" strokeDasharray="1 2" />
      <rect x={20} y={45} width={40} height={20} fill="none" className="ln" />
      <rect x={23} y={48} width={14} height={14} fill="none" className="ln" />
      <H x={20} y={45} />
      <H x={60} y={45} />
      <H x={20} y={65} />
      <H x={60} y={65} />
      <rect x={100} y={45} width={40} height={20} rx={10} fill="var(--l2)" />
      <rect
        x={100}
        y={45}
        width={40}
        height={20}
        rx={10}
        fill="var(--a)"
        className="zfq-fill"
      />
      <g className="zfq-thumb">
        <circle
          cx={110}
          cy={55}
          r={7.5}
          fill="var(--th)"
          stroke="var(--l2)"
          strokeWidth={0.6}
        />
      </g>
      <rect x={20} y={78} width={40} height={3} rx={1.5} fill="var(--l2)" />
      <rect
        x={100}
        y={78}
        width={40}
        height={3}
        rx={1.5}
        fill="var(--a)"
        opacity={0.6}
      />
    </g>
  )
}

const minis: Record<DiagramKey, ComponentType> = {
  principles: Principles,
  machines: Machines,
  events: Events,
  anatomy: Anatomy,
  adapters: Adapters,
  a11y: A11y,
  styling: Styling,
}

const labels: Record<DiagramKey, string> = {
  principles: "Three stacked layers: behavior, props and your markup",
  machines: "Four states in a loop, one lit at a time",
  events: "A key press becoming an event that moves a highlight",
  anatomy: "A menu wireframe with callouts to its parts",
  adapters: "One machine wired out to five frameworks",
  a11y: "A dialog with a focus ring moving between its buttons",
  styling: "The same switch unstyled and styled",
}

export function FlatMiniArt(props: { kind: DiagramKey }) {
  const Art = minis[props.kind]
  return (
    <svg
      className="zfq"
      viewBox="0 0 160 110"
      width="100%"
      aria-label={labels[props.kind]}
    >
      <style>{css}</style>
      <Art />
    </svg>
  )
}
