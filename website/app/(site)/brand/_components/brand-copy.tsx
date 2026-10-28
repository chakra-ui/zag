"use client"

import * as clipboard from "@zag-js/clipboard"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { brand } from "styled-system/recipes"

function useCopy(value: string) {
  const service = useMachine(clipboard.machine, {
    id: useId(),
    value,
    timeout: 1400,
  })
  return clipboard.connect(service, normalizeProps)
}

export function CopyHex(props: { value: string; label: string }) {
  const api = useCopy(props.value)
  const styles = brand()
  return (
    <div {...api.getRootProps()}>
      <button
        {...api.getTriggerProps()}
        aria-label={`Copy ${props.label} hex ${props.value}`}
        className={styles.copy}
      >
        <span>{props.value}</span>
        <span
          className={styles.copyValue}
          data-copied={api.copied || undefined}
        >
          {api.copied ? "copied" : "copy"}
        </span>
      </button>
    </div>
  )
}

export function CopySnippet(props: { label: string; value: string }) {
  const api = useCopy(props.value)
  const styles = brand()
  return (
    <div {...api.getRootProps()} className={styles.snippet}>
      <div className={styles.snippetBar}>
        <span className={styles.snippetLabel}>{props.label}</span>
        <button
          {...api.getTriggerProps()}
          aria-label={`Copy ${props.label} snippet`}
          className={styles.snippetButton}
          data-copied={api.copied || undefined}
        >
          {api.copied ? "copied" : "copy"}
        </button>
      </div>
      <pre tabIndex={0} className={styles.code}>
        {props.value}
      </pre>
    </div>
  )
}
