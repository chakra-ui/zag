import * as field from "@zag-js/field"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/field.css"

export default function Page() {
  const service = useMachine(field.machine, () => ({
    id: createUniqueId(),
    required: true,
    target: "amount",
  }))

  const api = createMemo(() => field.connect(service, normalizeProps))

  return (
    <>
      <main class="field-page">
        <h1>Field — Item</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            console.log(Object.fromEntries(new FormData(e.currentTarget)))
          }}
        >
          <div {...api().getRootProps()}>
            <label {...api().getLabelProps()}>
              Amount <span {...api().getIndicatorProps({ type: "required" })}>*</span>
            </label>
            <div class="field-item-row">
              <select
                {...api().getSelectProps({ item: "currency" })}
                name="currency"
                data-testid="currency"
                aria-label="Currency"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
              <input
                {...api().getInputProps({ item: "amount" })}
                name="amount"
                data-testid="amount"
                placeholder="0.00"
              />
            </div>
            <span {...api().getHelperTextProps()}>The field tracks the amount. Currency is a sibling control.</span>
            <span {...api().getErrorTextProps()}>{api().errors[0] ?? "Field is invalid"}</span>
          </div>
          <div class="actions">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
          </div>
        </form>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
