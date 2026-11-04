"use client"

import * as tabs from "@zag-js/tabs"
import { normalizeProps, useMachine } from "@zag-js/react"
import { examples } from "demos/examples"
import { openInStackblitz } from "lib/open-in-stackblitz"
import { usePathname } from "next/navigation"
import { useId } from "react"
import { SiStackblitz } from "react-icons/si"
import { cx } from "styled-system/css"
import { example } from "styled-system/recipes"
import * as bar from "./code-bar.css"

const demoNames: Record<string, string | null> = {
  progress: "progress-linear",
  "radio-group": "radio",
  "rating-group": "rating",
  timer: "timer-countdown",
  toc: null,
}

interface ExampleProps {
  id?: keyof typeof examples
  children?: React.ReactNode
}

export function Example(props: ExampleProps) {
  const Demo = props.id ? examples[props.id] : undefined
  const service = useMachine(tabs.machine, {
    id: useId(),
    defaultValue: Demo ? "preview" : "code",
  })
  const api = tabs.connect(service, normalizeProps)
  const styles = example()
  const slug = usePathname().split("/").pop() ?? ""
  const demoName = slug in demoNames ? demoNames[slug] : slug

  if (!Demo) return <>{props.children}</>

  return (
    <div {...api.getRootProps()} className={styles.root}>
      <div className={styles.bar}>
        <div {...api.getListProps()} className={styles.list}>
          <button
            {...api.getTriggerProps({ value: "preview" })}
            className={styles.tab}
          >
            Preview
          </button>
          <button
            {...api.getTriggerProps({ value: "code" })}
            className={styles.tab}
          >
            Code
          </button>
        </div>
        {demoName && (
          <button
            type="button"
            className={cx(bar.action, bar.end)}
            onClick={() => openInStackblitz(demoName, {})}
          >
            <SiStackblitz data-brand aria-hidden />
            Open in StackBlitz
          </button>
        )}
      </div>
      <div
        {...api.getContentProps({ value: "preview" })}
        className={styles.stage}
      >
        <Demo />
      </div>
      <div {...api.getContentProps({ value: "code" })} className={styles.code}>
        {props.children}
      </div>
    </div>
  )
}
