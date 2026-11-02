import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, createMemo, createUniqueId } from "solid-js"
import "@styles/date-picker.css"

export default function Page() {
  let nextFieldRef: HTMLInputElement | undefined
  const service = useMachine(datePicker.machine, {
    id: createUniqueId(),
    locale: "en",
    onValueChange() {
      nextFieldRef?.focus()
    },
  })
  const api = createMemo(() => datePicker.connect(service, normalizeProps))
  return (
    <main class="date-picker">
      <div {...api().getControlProps()}>
        <input {...api().getInputProps()} />
        <button {...api().getTriggerProps()}>🗓</button>
      </div>
      <input ref={nextFieldRef} data-testid="next-field" placeholder="Next field" />
      <div {...api().getPositionerProps()}>
        <div {...api().getContentProps()}>
          <table {...api().getTableProps({ view: "day" })}>
            <tbody {...api().getTableBodyProps({ view: "day" })}>
              <For each={api().weeks}>
                {(week) => (
                  <tr {...api().getTableRowProps({ view: "day" })}>
                    <For each={week}>
                      {(value) => (
                        <td {...api().getDayTableCellProps({ value })}>
                          <div {...api().getDayTableCellTriggerProps({ value })}>{value.day}</div>
                        </td>
                      )}
                    </For>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
