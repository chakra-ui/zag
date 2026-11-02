"use client"

import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useRef } from "react"
import "@styles/date-picker.css"

export default function Page() {
  const nextFieldRef = useRef<HTMLInputElement>(null)
  const service = useMachine(datePicker.machine, {
    id: useId(),
    locale: "en",
    onValueChange() {
      nextFieldRef.current?.focus()
    },
  })
  const api = datePicker.connect(service, normalizeProps)
  return (
    <main className="date-picker">
      <div {...api.getControlProps()}>
        <input {...api.getInputProps()} />
        <button {...api.getTriggerProps()}>🗓</button>
      </div>
      <input ref={nextFieldRef} data-testid="next-field" placeholder="Next field" />
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <table {...api.getTableProps({ view: "day" })}>
            <tbody {...api.getTableBodyProps({ view: "day" })}>
              {api.weeks.map((week, i) => (
                <tr key={i} {...api.getTableRowProps({ view: "day" })}>
                  {week.map((value, j) => (
                    <td key={j} {...api.getDayTableCellProps({ value })}>
                      <div {...api.getDayTableCellTriggerProps({ value })}>{value.day}</div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
