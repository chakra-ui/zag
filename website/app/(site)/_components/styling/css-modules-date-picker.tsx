"use client"

import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/react"
import { CodePanel } from "components/ui/code-panel"
import { Inspector } from "components/ui/inspector"
import { useId } from "react"
import { stylingBand } from "styled-system/recipes"
import { attrRows } from "./attrs"
import styles from "./date-picker.module.css"

const componentCode = `import styles from "./DatePicker.module.css"

<td {...api.getDayTableCellProps({ value })}>
  <div
    {...api.getDayTableCellTriggerProps({ value })}
    className={styles.day}
  >
    {value.day}
  </div>
</td>`

const cssCode = `.day { border-radius: 8px; }
.day[data-today] { font-weight: 700; }
.day[data-in-range] { background: var(--colors-green-900); }
.day[data-range-start], .day[data-range-end] {
  background: var(--colors-green-400);
  color: black;
}
.day[data-unavailable] { text-decoration: line-through; }`

export function CssModulesDatePicker() {
  const api = datePicker.connect(
    useMachine(datePicker.machine, {
      id: useId(),
      locale: "en-US",
      inline: true,
      selectionMode: "range",
      defaultValue: [
        datePicker.parse("2026-10-13"),
        datePicker.parse("2026-10-16"),
      ],
      defaultFocusedValue: datePicker.parse("2026-10-13"),
      isDateUnavailable: (date) => date.day === 7 || date.day === 21,
    }),
    normalizeProps,
  )
  const band = stylingBand()
  const inspected = api.value[0] ?? api.focusedValue
  const label = inspected.toDate("UTC").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
  return (
    <>
      <div className={band.top}>
        <div className={band.stage}>
          <div {...api.getContentProps()} className={styles.root}>
            <div {...api.getViewControlProps()} className={styles.header}>
              <button {...api.getPreviousTriggerProps()} className={styles.nav}>
                ‹
              </button>
              <span className={styles.title}>{api.visibleRangeText.start}</span>
              <button {...api.getNextTriggerProps()} className={styles.nav}>
                ›
              </button>
            </div>
            <table {...api.getTableProps()} className={styles.table}>
              <thead {...api.getTableHeaderProps()}>
                <tr {...api.getTableRowProps()}>
                  {api.weekDays.map((day) => (
                    <th
                      key={day.long}
                      scope="col"
                      aria-label={day.long}
                      className={styles.weekday}
                    >
                      {day.short.slice(0, 2)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody {...api.getTableBodyProps()}>
                {api.weeks.map((week, i) => (
                  <tr key={i} {...api.getTableRowProps()}>
                    {week.map((value) => (
                      <td
                        key={value.toString()}
                        {...api.getDayTableCellProps({ value })}
                        className={styles.cell}
                      >
                        <div
                          {...api.getDayTableCellTriggerProps({ value })}
                          className={styles.day}
                          data-inspected={
                            value.compare(inspected) === 0 || undefined
                          }
                        >
                          {value.day}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className={band.side}>
          <Inspector
            part={`day · ${label}`}
            rows={attrRows(
              api.getDayTableCellTriggerProps({ value: inspected }),
              [
                "data-range-start",
                "data-selected",
                "data-value",
                "data-today",
                "data-unavailable",
              ],
              "data-range-start",
            )}
          />
        </div>
      </div>
      <div className={band.code} data-split="">
        <CodePanel
          file="DatePicker.tsx"
          language="tsx"
          code={componentCode}
          highlight={[6]}
        />
        <CodePanel
          file="DatePicker.module.css"
          language="css"
          code={cssCode}
          highlight={[4, 5, 6, 7]}
        />
      </div>
    </>
  )
}
