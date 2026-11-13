import * as field from "@zag-js/field"
import * as fieldset from "@zag-js/fieldset"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, Show } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/field.css"
import "@styles/fieldset.css"

export default function Page() {
  const [sameAsBilling, setSameAsBilling] = createSignal(false)
  const [output, setOutput] = createSignal("")

  const fieldsetId = createUniqueId()
  const fieldsetService = useMachine(fieldset.machine, () => ({
    id: fieldsetId,
    disabled: sameAsBilling(),
  }))
  const fieldsetApi = createMemo(() => fieldset.connect(fieldsetService, normalizeProps))

  // disabled inheritance is DOM-based: the fields pick it up from <fieldset disabled>
  const streetId = createUniqueId()
  const streetService = useMachine(field.machine, () => ({ id: streetId }))
  const streetApi = createMemo(() => field.connect(streetService, normalizeProps))

  const postalId = createUniqueId()
  const postalService = useMachine(field.machine, () => ({ id: postalId }))
  const postalApi = createMemo(() => field.connect(postalService, normalizeProps))

  return (
    <>
      <main>
        <div class="field-page shipping-address">
          <p class="hint">Tick "Same as billing address" to disable every field.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setOutput(JSON.stringify(Object.fromEntries(new FormData(e.currentTarget)), null, 2))
            }}
            onReset={() => {
              setSameAsBilling(false)
              setOutput("")
            }}
          >
            <label class="same-as-billing">
              <input
                type="checkbox"
                name="sameAsBilling"
                checked={sameAsBilling()}
                onChange={(e) => setSameAsBilling(e.currentTarget.checked)}
              />
              Same as billing address
            </label>
            <fieldset {...fieldsetApi().getRootProps()}>
              <legend {...fieldsetApi().getLegendProps()}>Shipping address</legend>
              <span {...fieldsetApi().getHelperTextProps()}>Where should we deliver your order?</span>
              <div {...streetApi().getRootProps()}>
                <label {...streetApi().getLabelProps()}>Street address</label>
                <input {...streetApi().getInputProps()} name="street" placeholder="1600 Pennsylvania Avenue NW" />
              </div>
              <div {...postalApi().getRootProps()}>
                <label {...postalApi().getLabelProps()}>Postal code</label>
                <input {...postalApi().getInputProps()} name="postalCode" placeholder="20500" />
              </div>
            </fieldset>
            <div class="actions">
              <button type="submit">Save address</button>
              <button type="reset">Reset</button>
            </div>
          </form>
          <Show when={output()}>
            <pre class="output" data-testid="form-output">
              {output()}
            </pre>
          </Show>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={fieldsetService} />
        <StateVisualizer state={streetService} />
        <StateVisualizer state={postalService} />
      </Toolbar>
    </>
  )
}
