import type { ReactNode } from "react"
import { inspector, type InspectorVariantProps } from "styled-system/recipes"

export interface InspectorRow {
  name: string
  value?: string
  on: boolean
  note?: string
  active?: boolean
}

export interface InspectorProps extends InspectorVariantProps {
  part: string
  rows: InspectorRow[]
  footer?: ReactNode
}

export function Inspector(props: InspectorProps) {
  const { part, rows, footer, tone } = props
  const styles = inspector({ tone })
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <p className={styles.label}>Inspecting</p>
        <p className={styles.part}>{part}</p>
      </div>
      <ul className={styles.list} aria-label={`Attributes on ${part}`}>
        {rows.map((row) => (
          <li
            key={row.name}
            className={styles.row}
            data-on={row.on || undefined}
            data-active={row.active || undefined}
          >
            <span className={styles.dot} />
            <span className={styles.name}>{row.name}</span>
            <span
              className={styles.value}
              data-string={row.value ? "" : undefined}
            >
              {row.value ? `"${row.value}"` : row.on ? "on" : "off"}
              {row.note && <span className={styles.note}> · {row.note}</span>}
            </span>
          </li>
        ))}
      </ul>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  )
}
