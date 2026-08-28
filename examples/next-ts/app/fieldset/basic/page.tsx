"use client"

import * as field from "@zag-js/field"
import * as fieldset from "@zag-js/fieldset"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/field.css"

export default function Page() {
  const [disabled, setDisabled] = useState(false)
  const [invalid, setInvalid] = useState(false)

  const fieldsetService = useMachine(fieldset.machine, {
    id: useId(),
    disabled,
    invalid,
  })
  const fieldsetApi = fieldset.connect(fieldsetService, normalizeProps)

  // disabled inheritance is DOM-based: the field picks it up from <fieldset disabled>
  const fieldService = useMachine(field.machine, {
    id: useId(),
    required: true,
  })
  const fieldApi = field.connect(fieldService, normalizeProps)

  return (
    <>
      <main className="field-page">
        <h1>Fieldset — Basic</h1>
        <div className="options">
          <label>
            <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.currentTarget.checked)} />
            Disabled
          </label>
          <label>
            <input type="checkbox" checked={invalid} onChange={(e) => setInvalid(e.currentTarget.checked)} />
            Invalid
          </label>
        </div>
        <form onSubmit={(e) => e.preventDefault()}>
          <fieldset {...fieldsetApi.getRootProps()}>
            <legend {...fieldsetApi.getLegendProps()}>Contact details</legend>
            <span {...fieldsetApi.getHelperTextProps()}>How can we reach you?</span>
            <div {...fieldApi.getRootProps()}>
              <label {...fieldApi.getLabelProps()}>
                Phone <span {...fieldApi.getIndicatorProps({ type: "required" })}>*</span>
              </label>
              <input {...fieldApi.getInputProps()} type="tel" placeholder="+1 555 000 0000" />
              <span {...fieldApi.getErrorTextProps()}>{fieldApi.errors[0]}</span>
            </div>
            <span {...fieldsetApi.getErrorTextProps()}>Contact details are incomplete</span>
          </fieldset>
          <div className="actions">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
          </div>
        </form>
      </main>

      <Toolbar viz>
        <StateVisualizer state={fieldsetService} />
        <StateVisualizer state={fieldService} />
      </Toolbar>
    </>
  )
}
