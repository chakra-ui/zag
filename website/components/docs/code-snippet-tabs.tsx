"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as tabs from "@zag-js/tabs"
import type { ReactNode } from "react"
import { FRAMEWORKS, frameworks } from "../../lib/framework-utils"
import * as styles from "./code-snippet-tabs.css"
import { CopyButton } from "./copy-button"
import { useFramework } from "./framework"

export interface SnippetPanel {
  node: ReactNode
  /** raw source, for the copy button */
  code: string
}

interface CodeSnippetTabsProps {
  id: string
  /** snippet per framework, `null` when a framework has none */
  panels: Record<string, SnippetPanel | null>
}

export function CodeSnippetTabs(props: CodeSnippetTabsProps) {
  const { framework: userFramework } = useFramework()

  const service = useMachine(tabs.machine, {
    id: props.id,
    defaultValue: userFramework ?? "react",
  })

  const api = tabs.connect(service, normalizeProps)
  const current = props.panels[api.value ?? ""]

  return (
    <div className={styles.root} {...api.getRootProps()}>
      <div className={styles.bar}>
        <div className={styles.list} {...api.getListProps()}>
          {FRAMEWORKS.map((framework) => {
            const { icon: FrameworkIcon, label } = frameworks[framework]
            return (
              <button
                key={framework}
                className={styles.tab}
                {...api.getTriggerProps({ value: framework })}
              >
                <FrameworkIcon aria-hidden />
                {label}
              </button>
            )
          })}
        </div>
        {current && <CopyButton content={current.code} />}
      </div>
      {FRAMEWORKS.map((framework) => (
        <div
          key={framework}
          className={styles.panel}
          {...api.getContentProps({ value: framework })}
        >
          {props.panels[framework]?.node ?? (
            <p className={styles.empty}>
              No snippet for {frameworks[framework].label} yet.
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
