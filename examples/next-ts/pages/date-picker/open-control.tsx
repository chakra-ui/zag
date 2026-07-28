import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default function Page() {
  const service = useMachine(datePicker.machine, {
    id: useId(),
    locale: "en",
    open: false,
    defaultOpen: true,
  })

  const api = datePicker.connect(service, normalizeProps)

  return (
    <>
      <main className="date-picker">
        <div {...api.getControlProps()}>
          <input {...api.getInputProps()} />
          <button {...api.getTriggerProps()}>🗓</button>
        </div>

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

      <Toolbar viz>
        <StateVisualizer state={service} omit={["weeks"]} />
      </Toolbar>
    </>
  )
}
