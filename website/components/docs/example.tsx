"use client"

import * as tabs from "@zag-js/tabs"
import { normalizeProps, useMachine } from "@zag-js/react"
import { examples } from "demos/examples"
import { useId } from "react"
import { example } from "styled-system/recipes"

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

  if (!Demo) {
    return (
      <div className={styles.root} data-code-only="">
        <div className={styles.bar}>
          <span className={styles.chip}>code only</span>
        </div>
        <div className={styles.code}>{props.children}</div>
      </div>
    )
  }

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
        <span className={styles.chip} data-live="">
          live
        </span>
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
