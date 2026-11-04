"use client"

import { useEffect, useId, useRef, useState } from "react"
import { HiChevronDown } from "react-icons/hi"
import { cx } from "styled-system/css"
import * as styles from "./code-block.css"
import { FileIcon } from "./file-icon"

// matches styles.pre's max height; a little slack so near-misses don't get a toggle
const collapsedHeight = 480

type CodeBlockProps = React.ComponentProps<"pre"> & { "data-title"?: string }

/** MDX `pre`: caps tall code at a fixed height with a show more/less toggle, and an optional title */
export function CodeBlock({ "data-title": title, ...props }: CodeBlockProps) {
  const ref = useRef<HTMLPreElement>(null)
  const id = useId()
  const [overflowing, setOverflowing] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const check = () => setOverflowing(el.scrollHeight > collapsedHeight + 24)
    check()
    const observer = new ResizeObserver(check)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const collapsible = overflowing || expanded

  const body = (
    <div
      className={styles.body}
      data-collapsible={collapsible || undefined}
      data-expanded={expanded || undefined}
    >
      <pre
        ref={ref}
        id={id}
        // scrollable code must be keyboard focusable
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        {...props}
        className={cx("prose", styles.pre, props.className)}
      />
      {collapsible && (
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? "Show less" : "Show more"}
          <HiChevronDown aria-hidden />
        </button>
      )}
    </div>
  )

  if (!title) return body

  return (
    <figure className={styles.frame}>
      <figcaption className={styles.header}>
        <FileIcon name={title} />
        {title}
      </figcaption>
      {body}
    </figure>
  )
}
