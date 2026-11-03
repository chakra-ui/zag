"use client"

import type { CSSProperties } from "react"
import { cx } from "styled-system/css"
import { Arrow } from "./arrow"
import { highlight } from "./highlight"
import { h2, lede, section, tierName, wrap } from "./home.css"
import * as styles from "./styling.css"
import { useStep } from "./use-step"
import { useTabs } from "./use-tabs"

type Line = string | { text: string; active: boolean }

interface Tool {
  name: string
  logo: string
  mono: boolean
  code: (dragging: boolean) => Line[]
}

const steps = [
  { dragging: false, value: 62 },
  { dragging: true, value: 62 },
  { dragging: true, value: 40 },
  { dragging: false, value: 40 },
]

const zagCode = (dragging: boolean): Line[] => [
  "<div {...api.getRootProps()}>",
  "  <div {...api.getTrackProps()}>",
  "    <div {...api.getRangeProps()} />",
  "  </div>",
  { text: "  <div {...api.getThumbProps({ index: 0 })} />", active: dragging },
  "</div>",
]

const tools: Tool[] = [
  {
    name: "Panda",
    logo: "/logos/panda.svg",
    mono: true,
    code: (dragging) => [
      "export const slider = sva({",
      "  slots: anatomy.keys(),",
      "  base: {",
      '    range: { bg: "green.500" },',
      "    thumb: {",
      '      boxSize: "6",',
      '      rounded: "full",',
      "    },",
      { text: '    _dragging: { scale: "1.15" },', active: dragging },
      "  },",
      "})",
    ],
  },
  {
    name: "Tailwind",
    logo: "/logos/tailwind.svg",
    mono: false,
    code: (dragging) => [
      "<div",
      "  {...api.getThumbProps({ index: 0 })}",
      '  className="size-6 rounded-full bg-white',
      "    ring-2 ring-zinc-900 transition",
      { text: '    data-dragging:scale-115"', active: dragging },
      "/>",
    ],
  },
  {
    name: "CSS Modules",
    logo: "/logos/css-modules.svg",
    mono: true,
    code: (dragging) => [
      ".thumb {",
      "  width: 24px;",
      "  height: 24px;",
      "  border-radius: 999px;",
      "}",
      { text: ".thumb[data-dragging] {", active: dragging },
      { text: "  scale: 1.15;", active: dragging },
      "}",
    ],
  },
]

function Code({ lines }: { lines: Line[] }) {
  return (
    <pre className={styles.code}>
      {lines.map((line, i) => {
        const { text, active } =
          typeof line === "string" ? { text: line, active: false } : line
        return (
          <span key={i} className={styles.line({ active })}>
            {highlight(text)}
          </span>
        )
      })}
    </pre>
  )
}

function Logo({ tool }: { tool: Tool }) {
  return (
    <img
      className={styles.toolLogo({ mono: tool.mono })}
      src={tool.logo}
      width={16}
      height={16}
      alt=""
    />
  )
}

function Slider({ value, dragging }: { value: number; dragging: boolean }) {
  return (
    <div className={styles.slider}>
      <span className={styles.sliderLabel}>
        Volume <span className={styles.sliderValue}>{value}</span>
      </span>
      <div
        className={styles.sliderTrack}
        style={{ "--value": `${value}%` } as CSSProperties}
      >
        <div className={styles.sliderRange} />
        <div
          className={styles.sliderThumb}
          data-dragging={dragging || undefined}
        />
      </div>
    </div>
  )
}

export function StylingSection() {
  const api = useTabs("home-styling", tools[0].name)
  const [ref, step] = useStep<HTMLDivElement>(steps.length, 1600)
  const tool = tools.find((t) => t.name === api.value) ?? tools[0]
  const { dragging, value } = steps[step]

  return (
    <section
      className={cx(wrap, section)}
      aria-label="Styling"
      {...api.getRootProps()}
    >
      <div className={styles.header}>
        <div className={styles.intro}>
          <h2 className={h2}>Headless components. Style it your way</h2>
          <p className={lede}>
            Every part tells you what it is and what state it's in. Target it
            with Panda, Tailwind or plain CSS
          </p>
        </div>
        <div
          {...api.getListProps()}
          aria-label="Styling tool"
          className={styles.toolTabs}
        >
          {tools.map((t) => (
            <button
              key={t.name}
              className={styles.toolTab}
              {...api.getTriggerProps({ value: t.name })}
            >
              <Logo tool={t} />
              {t.name}
            </button>
          ))}
        </div>
      </div>
      <div ref={ref} className={styles.stage}>
        {tools.map((t) => (
          <div key={t.name} {...api.getContentProps({ value: t.name })}>
            {t.name === tool.name && (
              <div className={styles.panel}>
                <div className={styles.column}>
                  <p className={tierName}>
                    <b>Zag code</b> · spread the props
                  </p>
                  <div className={styles.plate({ tone: "code" })}>
                    <Code lines={zagCode(dragging)} />
                    <div className={styles.attrs}>
                      <span className={styles.pill()}>thumb</span>
                      <span className={styles.pill({ active: dragging })}>
                        data-dragging
                      </span>
                      <span className={styles.pill()}>
                        aria-valuenow="{value}"
                      </span>
                    </div>
                  </div>
                </div>
                <Arrow />
                <div className={styles.column}>
                  <p className={cx(tierName, styles.toolLabel)}>
                    <b>You write</b> ·{" "}
                    <span className={styles.toolName}>
                      <Logo tool={tool} />
                      {tool.name}
                    </span>
                  </p>
                  <div className={styles.plate({ tone: "code" })}>
                    <Code lines={tool.code(dragging)} />
                  </div>
                </div>
                <Arrow />
                <div className={styles.column}>
                  <p className={tierName}>
                    <b>You get</b> · the same slider
                  </p>
                  <div className={styles.plate({ tone: "output" })}>
                    <Slider value={value} dragging={dragging} />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
