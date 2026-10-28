"use client"

import * as tabs from "@zag-js/tabs"
import { normalizeProps, useMachine } from "@zag-js/react"
import { examples } from "demos/examples"
import { openInStackblitz } from "lib/open-in-stackblitz"
import { usePathname } from "next/navigation"
import { useId } from "react"
import { SiStackblitz } from "react-icons/si"
import { docAction, example } from "styled-system/recipes"

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
      <div {...api.getListProps()} className={styles.bar}>
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
        {demoName && (
          <button
            type="button"
            data-brand="stackblitz"
            className={docAction()}
            style={{ marginInlineStart: "auto" }}
            onClick={() => openInStackblitz(demoName, {})}
          >
            <SiStackblitz aria-hidden />
            StackBlitz
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
