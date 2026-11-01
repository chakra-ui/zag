"use client"

import * as checkbox from "@zag-js/checkbox"
import { normalizeProps, useMachine } from "@zag-js/react"
import { checkboxControls } from "@zag-js/shared"
import serialize from "form-serialize"
import { CheckIcon } from "lucide-react"
import { useId } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import { useControls } from "@/hooks/use-controls"
import "@styles/checkbox.css"

export default function Page() {
  const controls = useControls(checkboxControls)

  const service = useMachine(checkbox.machine, {
    id: useId(),
    name: "checkbox",
    ...controls.context,
  })

  const api = checkbox.connect(service, normalizeProps)

  return (
    <>
      <main className="checkbox">
        <form
          className="vstack gap-4"
          onChange={(e) => {
            const result = serialize(e.currentTarget, { hash: true })
            console.log(result)
          }}
        >
          <label {...api.getRootProps()}>
            <div {...api.getControlProps()}>
              <span {...api.getIndicatorProps()}>
                <CheckIcon />
              </span>
            </div>
            <span {...api.getLabelProps()}>Accept terms and conditions</span>
            <input {...api.getHiddenInputProps()} data-testid="hidden-input" />
          </label>

          <div className="hstack">
            <button type="button" disabled={api.checked} onClick={() => api.setChecked(true)}>
              Check
            </button>
            <button type="button" disabled={!api.checked} onClick={() => api.setChecked(false)}>
              Uncheck
            </button>
            <button type="reset">Reset Form</button>
          </div>
        </form>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
