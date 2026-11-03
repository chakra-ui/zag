"use client"

import Link from "next/link"
import { useState } from "react"
import { cx } from "styled-system/css"
import { frameworks } from "./frameworks"
import { highlight } from "./highlight"
import { wrap } from "./home.css"
import * as styles from "./start.css"
import { useTabs } from "./use-tabs"

type Framework = (typeof frameworks)[number]

const snippet = (fw: Framework) => [
  'import * as menu from "@zag-js/menu"',
  `import { useMachine, normalizeProps } from "@zag-js/${fw.pkg}"`,
  "",
  'const service = useMachine(menu.machine, { id: "actions" })',
  `const api = ${fw.api}`,
  "",
  `<button ${fw.spread("getTriggerProps()")}>Actions</button>`,
]

function CopyIcon({ copied }: { copied: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={copied ? 1.6 : 1.4}
      aria-hidden="true"
    >
      {copied ? (
        <path
          d="M3 8.5 6.5 12 13 4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <>
          <rect x="5" y="5" width="8.5" height="8.5" rx="2" />
          <path d="M10.5 5V3.5a1.5 1.5 0 0 0-1.5-1.5H3.5A1.5 1.5 0 0 0 2 3.5V9a1.5 1.5 0 0 0 1.5 1.5H5" />
        </>
      )}
    </svg>
  )
}

export function StartSection() {
  const api = useTabs("home-start", "react")
  const [copied, setCopied] = useState(false)

  const copy = () => {
    const fw = frameworks.find((f) => f.pkg === api.value) ?? frameworks[0]
    navigator.clipboard?.writeText(snippet(fw).join("\n")).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1600)
      },
      () => setCopied(false),
    )
  }

  return (
    <section className={cx(wrap, styles.startSection)} aria-label="Start">
      <div className={styles.finale}>
        <svg
          className={styles.finaleMark}
          viewBox="232 -4 146 126"
          aria-hidden="true"
        >
          <path
            d="M243.68 67.7895L310.68 13.0287L265.18 112L369.68 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="19"
          />
        </svg>
        <div className={styles.finaleCopy}>
          <h2 className={styles.finaleH2}>Start building with Zag today</h2>
          <p className={styles.finaleLede}>
            Install a component and your framework's adapter, then spread the
            props.
          </p>
          <Link className={styles.finaleCta} href="/overview/components">
            Browse components
          </Link>
        </div>
        <div className={styles.term} {...api.getRootProps()}>
          <div className={styles.termBar}>
            <div
              {...api.getListProps()}
              aria-label="Framework"
              className={styles.termTabs}
            >
              {frameworks.map((f) => (
                <button
                  key={f.name}
                  className={styles.termTab}
                  aria-label={f.name}
                  {...api.getTriggerProps({ value: f.pkg })}
                >
                  <f.Icon width={15} height={15} aria-hidden />
                  <span aria-hidden="true">{f.name}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className={styles.termCopy}
              onClick={copy}
              aria-label={copied ? "Copied" : "Copy code"}
            >
              <CopyIcon copied={copied} />
            </button>
          </div>
          {frameworks.map((fw) => (
            <pre
              key={fw.pkg}
              className={styles.termCode}
              {...api.getContentProps({ value: fw.pkg })}
            >
              {snippet(fw).map((line, i) => (
                <span key={i} className={styles.termLine}>
                  {line ? highlight(line) : " "}
                </span>
              ))}
            </pre>
          ))}
        </div>
      </div>
    </section>
  )
}
