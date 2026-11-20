"use client"

import * as editable from "@zag-js/editable"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import "@styles/editable.css"

const people = [
  { name: "Ada Lovelace", role: "Engineering" },
  { name: "Grace Hopper", role: "Platform" },
  { name: "Alan Turing", role: "Research" },
]

function NameCell(props: { row: number; defaultName: string; onLog: (entry: string) => void }) {
  const { row, defaultName, onLog } = props
  const [name, setName] = useState(defaultName)

  const service = useMachine(editable.machine, {
    id: useId(),
    defaultValue: defaultName,
    activationMode: "dblclick",
    translations: { edit: `Rename row ${row}` },
    onValueCommit: (details) => {
      if (details.value !== name) onLog(`Renamed ${name} to ${details.value}`)
      setName(details.value)
    },
    onValueRevert: (details) => onLog(`Kept ${details.value}`),
  })
  const api = editable.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <label className="visually-hidden" {...api.getLabelProps()}>
        Name, row {row}
      </label>
      <div {...api.getAreaProps()}>
        <input {...api.getInputProps()} />
        <span {...api.getPreviewProps()} />
      </div>
    </div>
  )
}

export default function Page() {
  const [activity, setActivity] = useState<string[]>([])
  const log = (entry: string) => setActivity((prev) => [entry, ...prev])

  return (
    <main>
      <div className="editable-table-cells">
        <p className="hint">Double-click a name to rename it</p>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Team</th>
            </tr>
          </thead>
          <tbody>
            {people.map((person, index) => (
              <tr key={person.name}>
                <td>
                  <NameCell row={index + 1} defaultName={person.name} onLog={log} />
                </td>
                <td>{person.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <ol className="activity" aria-label="Activity" reversed>
          {activity.map((entry, index) => (
            <li key={activity.length - index}>{entry}</li>
          ))}
        </ol>
      </div>
    </main>
  )
}
