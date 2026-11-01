/**
 * Manual testing page for Select with browser autofill.
 * Save an address in Chrome, focus the street input, pick the saved address;
 * the State select should update to the autofilled value.
 */
import * as select from "@zag-js/select"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronsUpDownIcon } from "lucide-solid"
import { createMemo, createUniqueId, For, Show } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/select.css"

const US_STATES = [
  { label: "Alabama", value: "AL" },
  { label: "California", value: "CA" },
  { label: "Florida", value: "FL" },
  { label: "New York", value: "NY" },
  { label: "Texas", value: "TX" },
]

export default function Page() {
  const service = useMachine(select.machine, {
    collection: select.collection({ items: US_STATES }),
    id: createUniqueId(),
    name: "state",
    autoComplete: "address-level1",
  })

  const api = createMemo(() => select.connect(service, normalizeProps))

  return (
    <main style={{ padding: "2rem", "max-width": "400px" }}>
      <h1>Select Autofill Test</h1>
      <p style={{ "margin-bottom": "1rem", color: "#666" }}>
        Fill street address first, then use Chrome autofill. State should update.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          console.log("Form submitted", Object.fromEntries(new FormData(e.currentTarget)))
        }}
      >
        <div style={{ "margin-bottom": "1rem" }}>
          <label for="street">Street address</label>
          <input
            id="street"
            name="street"
            type="text"
            autocomplete="street-address"
            style={{ display: "block", width: "100%", padding: "8px", "margin-top": "4px" }}
          />
        </div>

        <div {...api().getRootProps()} style={{ "margin-bottom": "1rem" }}>
          <label {...api().getLabelProps()}>State</label>
          <div {...api().getControlProps()}>
            <button
              {...api().getTriggerProps()}
              style={{
                display: "flex",
                width: "100%",
                padding: "8px",
                "margin-top": "4px",
                "justify-content": "space-between",
                "align-items": "center",
              }}
            >
              <span>{api().valueAsString || "Select state"}</span>
              <span {...api().getIndicatorProps()}>
                <ChevronsUpDownIcon />
              </span>
            </button>
          </div>

          <select {...api().getHiddenSelectProps()}>
            <Show when={api().empty}>
              <option value="" />
            </Show>
            <For each={US_STATES}>{(opt) => <option value={opt.value}>{opt.label}</option>}</For>
          </select>

          <Portal>
            <div {...api().getPositionerProps()}>
              <div {...api().getContentProps()}>
                <div {...api().getListProps()}>
                  <For each={US_STATES}>
                    {(item) => (
                      <div {...api().getItemProps({ item })}>
                        <span {...api().getItemTextProps({ item })}>{item.label}</span>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </div>
          </Portal>
        </div>

        <button type="submit">Submit</button>
      </form>
    </main>
  )
}
