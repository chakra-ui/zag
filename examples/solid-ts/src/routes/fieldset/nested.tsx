import * as checkbox from "@zag-js/checkbox"
import * as field from "@zag-js/field"
import * as fieldset from "@zag-js/fieldset"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { CheckIcon } from "lucide-solid"
import { createMemo, createSignal, createUniqueId } from "solid-js"
import "@styles/checkbox.css"
import "@styles/field.css"

export default function Page() {
  const [outerDisabled, setOuterDisabled] = createSignal(false)
  const [innerDisabled, setInnerDisabled] = createSignal(false)

  const shippingId = createUniqueId()
  const shippingService = useMachine(fieldset.machine, () => ({ id: shippingId, disabled: outerDisabled() }))
  const shipping = createMemo(() => fieldset.connect(shippingService, normalizeProps))

  const addressId = createUniqueId()
  const addressService = useMachine(fieldset.machine, () => ({ id: addressId, disabled: innerDisabled() }))
  const address = createMemo(() => fieldset.connect(addressService, normalizeProps))

  const nameService = useMachine(field.machine, { id: createUniqueId() })
  const name = createMemo(() => field.connect(nameService, normalizeProps))

  const streetService = useMachine(field.machine, { id: createUniqueId() })
  const street = createMemo(() => field.connect(streetService, normalizeProps))

  const saveService = useMachine(checkbox.machine, { id: createUniqueId(), name: "save" })
  const save = createMemo(() => checkbox.connect(saveService, normalizeProps))

  return (
    <main class="field-page">
      <div class="options">
        <label>
          <input
            type="checkbox"
            checked={outerDisabled()}
            onChange={(e) => setOuterDisabled(e.currentTarget.checked)}
          />
          Disable shipping
        </label>
        <label>
          <input
            type="checkbox"
            checked={innerDisabled()}
            onChange={(e) => setInnerDisabled(e.currentTarget.checked)}
          />
          Disable address
        </label>
      </div>
      <form onSubmit={(e) => e.preventDefault()}>
        <fieldset {...shipping().getRootProps()}>
          <legend {...shipping().getLegendProps()}>Shipping</legend>
          <div {...name().getRootProps()}>
            <label {...name().getLabelProps()}>Recipient</label>
            <input {...name().getInputProps()} name="recipient" />
          </div>

          <fieldset {...address().getRootProps()}>
            <legend {...address().getLegendProps()}>Address</legend>
            <div {...street().getRootProps()}>
              <label {...street().getLabelProps()}>Street</label>
              <input {...street().getInputProps()} name="street" />
            </div>
            <label {...save().getRootProps()}>
              <div {...save().getControlProps()}>
                <span {...save().getIndicatorProps()}>
                  <CheckIcon />
                </span>
              </div>
              <span {...save().getLabelProps()}>Save this address</span>
              <input {...save().getHiddenInputProps()} />
            </label>
          </fieldset>
        </fieldset>
      </form>
    </main>
  )
}
