import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/date-picker.css"

export default function Page() {
  const service = useMachine(datePicker.machine, {
    id: createUniqueId(),
    locale: "en",
    open: false,
    defaultOpen: true,
  })

  const api = createMemo(() => datePicker.connect(service, normalizeProps))

  return (
    <>
      <main class="date-picker">
        <div {...api().getControlProps()}>
          <input {...api().getInputProps()} />
          <button {...api().getTriggerProps()}>🗓</button>
        </div>

        <div {...api().getPositionerProps()}>
          <div {...api().getContentProps()}>
            <table {...api().getTableProps({ view: "day" })}>
              <tbody {...api().getTableBodyProps({ view: "day" })}>
                <Index each={api().weeks}>
                  {(week) => (
                    <tr {...api().getTableRowProps({ view: "day" })}>
                      <Index each={week()}>
                        {(value) => (
                          <td {...api().getDayTableCellProps({ value: value() })}>
                            <div {...api().getDayTableCellTriggerProps({ value: value() })}>{value().day}</div>
                          </td>
                        )}
                      </Index>
                    </tr>
                  )}
                </Index>
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
