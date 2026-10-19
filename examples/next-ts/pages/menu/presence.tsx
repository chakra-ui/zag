import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { Presence } from "../../components/presence"

export default function Page() {
  const [preventEscape, setPreventEscape] = useState(false)
  const [selected, setSelected] = useState("")
  const service = useMachine(menu.machine, {
    id: useId(),
    onSelect: ({ value }) => setSelected(value),
    onEscapeKeyDown(event) {
      if (preventEscape) event.preventDefault()
    },
  })
  const api = menu.connect(service, normalizeProps)

  return (
    <main>
      <h1>Menu with presence</h1>
      <p>The content mounts when the menu opens and unmounts after it closes.</p>
      <label>
        <input type="checkbox" checked={preventEscape} onChange={(event) => setPreventEscape(event.target.checked)} />
        Keep open on Escape
      </label>
      <p>
        Open: <output data-testid="open-state">{String(api.open)}</output>
      </p>
      <p>
        Selected: <output data-testid="selected-value">{selected || "none"}</output>
      </p>
      <p>
        <button data-testid="outside">Outside</button>
      </p>
      <button {...api.getTriggerProps()}>Actions</button>
      <Portal>
        <Presence {...api.getPositionerProps()} hidden={!api.open} lazyMount unmountOnExit>
          <ul {...api.getContentProps()}>
            <li {...api.getItemProps({ value: "edit" })}>Edit</li>
            <li {...api.getItemProps({ value: "duplicate" })}>Duplicate</li>
            <li {...api.getItemProps({ value: "delete" })}>Delete</li>
          </ul>
        </Presence>
      </Portal>
    </main>
  )
}
