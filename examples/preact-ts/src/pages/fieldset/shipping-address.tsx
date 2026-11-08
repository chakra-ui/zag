import * as field from "@zag-js/field"
import * as fieldset from "@zag-js/fieldset"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { useId, useState } from "preact/hooks"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/field.css"
import "@styles/fieldset.css"

export default function Page() {
  const [sameAsBilling, setSameAsBilling] = useState(false)
  const [output, setOutput] = useState("")

  const fieldsetService = useMachine(fieldset.machine, {
    id: useId(),
    disabled: sameAsBilling,
  })
  const fieldsetApi = fieldset.connect(fieldsetService, normalizeProps)

  // disabled inheritance is DOM-based: the fields pick it up from <fieldset disabled>
  const streetService = useMachine(field.machine, { id: useId() })
  const streetApi = field.connect(streetService, normalizeProps)

  const postalService = useMachine(field.machine, { id: useId() })
  const postalApi = field.connect(postalService, normalizeProps)

  return (
    <>
      <main>
        <div className="field-page shipping-address">
          <h1>Fieldset — Shipping address</h1>
          <p className="hint">
            Tick &quot;Same as billing address&quot; to disable the whole fieldset. Every field inside is disabled and
            left out of the submitted form.
          </p>
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
            <label className="same-as-billing">
              <input
                type="checkbox"
                name="sameAsBilling"
                checked={sameAsBilling}
                onChange={(e) => setSameAsBilling(e.currentTarget.checked)}
              />
              Same as billing address
            </label>
            <fieldset {...fieldsetApi.getRootProps()}>
              <legend {...fieldsetApi.getLegendProps()}>Shipping address</legend>
              <span {...fieldsetApi.getHelperTextProps()}>Where should we deliver your order?</span>
              <div {...streetApi.getRootProps()}>
                <label {...streetApi.getLabelProps()}>Street address</label>
                <input {...streetApi.getInputProps()} name="street" placeholder="1600 Pennsylvania Avenue NW" />
              </div>
              <div {...postalApi.getRootProps()}>
                <label {...postalApi.getLabelProps()}>Postal code</label>
                <input {...postalApi.getInputProps()} name="postalCode" placeholder="20500" />
              </div>
            </fieldset>
            <div className="actions">
              <button type="submit">Save address</button>
              <button type="reset">Reset</button>
            </div>
          </form>
          {output && (
            <pre className="output" data-testid="form-output">
              {output}
            </pre>
          )}
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
