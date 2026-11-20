import * as editable from "@zag-js/editable"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, For } from "solid-js"
import "@styles/editable.css"

const people = [
  { name: "Ada Lovelace", role: "Engineering" },
  { name: "Grace Hopper", role: "Platform" },
  { name: "Alan Turing", role: "Research" },
]

function NameCell(props: { row: number; defaultName: string; onLog: (entry: string) => void }) {
  let name = props.defaultName

  const service = useMachine(editable.machine, {
    id: createUniqueId(),
    defaultValue: props.defaultName,
    activationMode: "dblclick",
    translations: { edit: `Rename row ${props.row}` },
    onValueCommit: (details) => {
      if (details.value !== name) props.onLog(`Renamed ${name} to ${details.value}`)
      name = details.value
    },
    onValueRevert: (details) => props.onLog(`Kept ${details.value}`),
  })
  const api = createMemo(() => editable.connect(service, normalizeProps))

  return (
    <div {...api().getRootProps()}>
      <label class="visually-hidden" {...api().getLabelProps()}>
        Name, row {props.row}
      </label>
      <div {...api().getAreaProps()}>
        <input {...api().getInputProps()} />
        <span {...api().getPreviewProps()} />
      </div>
    </div>
  )
}

export default function Page() {
  const [activity, setActivity] = createSignal<string[]>([])
  const log = (entry: string) => setActivity((prev) => [entry, ...prev])

  return (
    <main>
      <div class="editable-table-cells">
        <p class="hint">Double-click a name to rename it. Enter saves, Escape puts it back.</p>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Team</th>
            </tr>
          </thead>
          <tbody>
            <For each={people}>
              {(person, index) => (
                <tr>
                  <td>
                    <NameCell row={index() + 1} defaultName={person.name} onLog={log} />
                  </td>
                  <td>{person.role}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
        <ol class="activity" data-testid="activity" aria-label="Activity" reversed>
          <For each={activity()}>{(entry) => <li>{entry}</li>}</For>
        </ol>
      </div>
    </main>
  )
}
