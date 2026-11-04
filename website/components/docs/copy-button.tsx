"use client"

import { useState } from "react"
import { LuCheck, LuCopy } from "react-icons/lu"
import * as styles from "./copy-button.css"

export function CopyButton(props: { content: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard?.writeText(props.content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    })
  }

  return (
    <button
      type="button"
      className={styles.button}
      onClick={copy}
      aria-label={copied ? "Copied" : "Copy code"}
    >
      {copied ? <LuCheck aria-hidden /> : <LuCopy aria-hidden />}
    </button>
  )
}
