"use client"

import { CodePanel } from "components/ui/code-panel"
import { useEffect, useMemo, useRef, useState } from "react"
import { explorer } from "styled-system/recipes"
import { explorerDemos } from "../../demos/explorer"

const HIGHLIGHT = "data-explorer-highlight"

const getterOf = (part: string) =>
  `get${part.charAt(0).toUpperCase()}${part.slice(1)}Props()`

export function Explorer(props: { id: string }) {
  const demo = explorerDemos[props.id]
  const stageRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [counts, setCounts] = useState<Record<string, number>>({})
  const current = hovered ?? active
  const parts = useMemo(() => demo.anatomy.build(), [demo])
  const keys = [...new Set(demo.anatomy.keys())]

  useEffect(() => {
    let highlighted: HTMLElement[] = []
    const find = (attr: string, ids: Set<string>) =>
      Array.from(document.querySelectorAll<HTMLElement>(`[${attr}]`)).filter(
        (el) => ids.has(el.getAttribute(attr) ?? ""),
      )

    const apply = () => {
      const ids = new Set<string>()
      for (const part of Object.values(parts)) {
        stageRef.current?.querySelectorAll(`[${part.attr}]`).forEach((el) => {
          ids.add(el.getAttribute(part.attr) ?? "")
        })
      }
      setCounts(
        Object.fromEntries(
          Object.entries(parts).map(([key, part]) => [
            key,
            find(part.attr, ids).length,
          ]),
        ),
      )
      for (const el of highlighted) el.removeAttribute(HIGHLIGHT)
      highlighted = current ? find(parts[current].attr, ids) : []
      for (const el of highlighted) el.setAttribute(HIGHLIGHT, "")
    }

    apply()
    const observer = new MutationObserver(apply)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      for (const el of highlighted) el.removeAttribute(HIGHLIGHT)
    }
  }, [current, parts])

  const Demo = demo.component
  const styles = explorer()
  const count = current ? (counts[current] ?? 0) : 0
  const code = current
    ? `<div {...api.${getterOf(current)}} />\n\n[${parts[current].attr}] {\n  outline: 2px dashed var(--colors-accent);\n}`
    : "// pick a part to see its getter and selector"

  return (
    <div className={styles.root}>
      <div className={styles.top}>
        <div ref={stageRef} className={styles.stage}>
          <Demo {...demo.props} />
        </div>
        <div className={styles.side}>
          <div className={styles.header}>
            <span>Parts</span>
            <span className={styles.hint}>
              {!current
                ? "hover or pick one"
                : count
                  ? `${count} on the page`
                  : "not rendered here"}
            </span>
          </div>
          <div className={styles.list}>
            {keys.map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={active === key}
                data-empty={counts[key] === 0 || undefined}
                className={styles.part}
                onMouseEnter={() => setHovered(key)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(key)}
                onBlur={() => setHovered(null)}
                onClick={() => setActive(active === key ? null : key)}
              >
                <span className={styles.getter}>{getterOf(key)}</span>
                <span className={styles.attr}>[{parts[key].attr}]</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <CodePanel language="tsx" code={code} highlight={current ? [1, 3] : []} />
    </div>
  )
}
