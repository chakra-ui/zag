/**
 * Manual testing page for Select with browser autofill.
 *
 * To test:
 * 1. Save an address in Chrome (Settings → Autofill → Addresses)
 * 2. Run: pnpm start-react (or pnpm dev in examples/next-ts)
 * 3. Open http://localhost:3000/select-autofill
 * 4. Click the Street address input
 * 5. When Chrome shows "Use saved address", select it
 * 6. The State select should update to show the autofilled value
 */
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { useId } from "react"

const US_STATES = [
  { label: "Alabama", value: "AL" },
  { label: "California", value: "CA" },
  { label: "Florida", value: "FL" },
  { label: "New York", value: "NY" },
  { label: "Texas", value: "TX" },
  // ... add more as needed
]

export default function SelectAutofillPage() {
  const service = useMachine(select.machine, {
    collection: select.collection({ items: US_STATES }),
    id: useId(),
    name: "state",
    autoComplete: "address-level1",
  })

  const api = select.connect(service, normalizeProps)

  return (
    <main style={{ padding: "2rem", maxWidth: 400 }}>
      <h1>Select Autofill Test</h1>
      <p style={{ marginBottom: "1rem", color: "#666" }}>
        Fill street address first, then use Chrome autofill. State should update.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          console.log("Form submitted", Object.fromEntries(new FormData(e.currentTarget)))
        }}
      >
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="street">Street address</label>
          <input
            id="street"
            name="street"
            type="text"
            autoComplete="street-address"
            style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>

        <div {...api.getRootProps()} style={{ marginBottom: "1rem" }}>
          <label {...api.getLabelProps()}>State</label>
          <div {...api.getControlProps()}>
            <button
              {...api.getTriggerProps()}
              style={{
                display: "flex",
                width: "100%",
                padding: 8,
                marginTop: 4,
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{api.valueAsString || "Select state"}</span>
              <span {...api.getIndicatorProps()}>▼</span>
            </button>
          </div>

          <select {...api.getHiddenSelectProps()}>
            {api.empty && <option value="" />}
            {US_STATES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <Portal>
            <div {...api.getPositionerProps()}>
              <ul {...api.getContentProps()}>
                {US_STATES.map((item) => (
                  <li key={item.value} {...api.getItemProps({ item })}>
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>
          </Portal>
        </div>

        <button type="submit">Submit</button>
      </form>
    </main>
  )
}
