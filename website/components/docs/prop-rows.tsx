"use client"

import * as collapsible from "@zag-js/collapsible"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { HiChevronDown } from "react-icons/hi"
import * as styles from "./prop-table.css"

export interface PropRow {
  name: string
  type: string
  shortType: string
  description: string
  defaultValue?: string
}

interface PropRowsProps {
  rows: PropRow[]
  label: string
  showDefault: boolean
}

export function PropRows(props: PropRowsProps) {
  const { rows, showDefault } = props
  const [open, setOpen] = useState<Set<string>>(() => new Set())
  const allOpen = open.size === rows.length

  const toggle = (name: string, next: boolean) =>
    setOpen((prev) => {
      const set = new Set(prev)
      if (next) set.add(name)
      else set.delete(name)
      return set
    })

  const columns = showDefault ? 4 : 3

  return (
    <div className={styles.root}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>{props.label}</th>
            <th className={styles.th}>Type</th>
            {showDefault && <th className={styles.th}>Default</th>}
            <th className={`${styles.th} ${styles.thEnd}`}>
              <button
                type="button"
                className={styles.expandAll}
                onClick={() =>
                  setOpen(
                    allOpen ? new Set() : new Set(rows.map((row) => row.name)),
                  )
                }
              >
                {allOpen ? "Collapse all" : "Expand all"}
              </button>
            </th>
          </tr>
        </thead>
        {rows.map((row) => (
          <Row
            key={row.name}
            row={row}
            columns={columns}
            showDefault={showDefault}
            open={open.has(row.name)}
            onOpenChange={(next) => toggle(row.name, next)}
          />
        ))}
      </table>
    </div>
  )
}

interface RowProps {
  row: PropRow
  columns: number
  showDefault: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

function Row(props: RowProps) {
  const { row, columns, showDefault } = props
  const service = useMachine(collapsible.machine, {
    id: useId(),
    open: props.open,
    onOpenChange: (details) => props.onOpenChange(details.open),
  })
  const api = collapsible.connect(service, normalizeProps)
  const trimmed = row.shortType !== row.type

  return (
    // each prop is its own tbody so the summary and details rows stay together
    <tbody className={styles.group} data-state={api.open ? "open" : "closed"}>
      <tr
        className={styles.summary}
        // the whole row toggles; the name button stays the accessible trigger
        onClick={(event) => {
          if ((event.target as Element).closest("button")) return
          api.setOpen(!api.open)
        }}
      >
        <td className={styles.cell}>
          <button className={styles.trigger} {...api.getTriggerProps()}>
            <code className={styles.key}>{row.name}</code>
          </button>
        </td>
        <td className={styles.cell}>
          <code className={styles.type}>{row.shortType}</code>
        </td>
        {showDefault && (
          <td className={styles.cell}>
            {row.defaultValue ? (
              <code className={styles.defaultValue}>{row.defaultValue}</code>
            ) : (
              <span className={styles.empty} aria-label="no default">
                —
              </span>
            )}
          </td>
        )}
        <td className={styles.chevronCell} aria-hidden>
          <HiChevronDown className={styles.chevron} />
        </td>
      </tr>
      <tr {...api.getContentProps()}>
        <td className={styles.details} colSpan={columns}>
          <p className={styles.description}>{row.description}</p>
          {trimmed && (
            <dl className={styles.meta}>
              <dt>Type</dt>
              <dd>
                <code className={styles.fullType}>{row.type}</code>
              </dd>
            </dl>
          )}
        </td>
      </tr>
    </tbody>
  )
}
