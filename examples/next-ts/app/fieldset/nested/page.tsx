"use client"

import * as checkbox from "@zag-js/checkbox"
import * as field from "@zag-js/field"
import * as fieldset from "@zag-js/fieldset"
import { normalizeProps, useMachine } from "@zag-js/react"
import { CheckIcon } from "lucide-react"
import { useId, useState } from "react"
import "@styles/checkbox.css"
import "@styles/field.css"

export default function Page() {
  const [outerDisabled, setOuterDisabled] = useState(false)
  const [innerDisabled, setInnerDisabled] = useState(false)

  const shippingService = useMachine(fieldset.machine, { id: useId(), disabled: outerDisabled })
  const shipping = fieldset.connect(shippingService, normalizeProps)

  const addressService = useMachine(fieldset.machine, { id: useId(), disabled: innerDisabled })
  const address = fieldset.connect(addressService, normalizeProps)

  const nameService = useMachine(field.machine, { id: useId() })
  const name = field.connect(nameService, normalizeProps)

  const streetService = useMachine(field.machine, { id: useId() })
  const street = field.connect(streetService, normalizeProps)

  const saveService = useMachine(checkbox.machine, { id: useId(), name: "save" })
  const save = checkbox.connect(saveService, normalizeProps)

  return (
    <main className="field-page">
      <div className="options">
        <label>
          <input type="checkbox" checked={outerDisabled} onChange={(e) => setOuterDisabled(e.currentTarget.checked)} />
          Disable shipping
        </label>
        <label>
          <input type="checkbox" checked={innerDisabled} onChange={(e) => setInnerDisabled(e.currentTarget.checked)} />
          Disable address
        </label>
      </div>
      <form onSubmit={(e) => e.preventDefault()}>
        <fieldset {...shipping.getRootProps()}>
          <legend {...shipping.getLegendProps()}>Shipping</legend>
          <div {...name.getRootProps()}>
            <label {...name.getLabelProps()}>Recipient</label>
            <input {...name.getInputProps()} name="recipient" />
          </div>

          <fieldset {...address.getRootProps()}>
            <legend {...address.getLegendProps()}>Address</legend>
            <div {...street.getRootProps()}>
              <label {...street.getLabelProps()}>Street</label>
              <input {...street.getInputProps()} name="street" />
            </div>
            <label {...save.getRootProps()}>
              <div {...save.getControlProps()}>
                <span {...save.getIndicatorProps()}>
                  <CheckIcon />
                </span>
              </div>
              <span {...save.getLabelProps()}>Save this address</span>
              <input {...save.getHiddenInputProps()} />
            </label>
          </fieldset>
        </fieldset>
      </form>
    </main>
  )
}
