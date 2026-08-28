"use client"

import * as field from "@zag-js/field"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/field.css"

const frameworks = ["React", "Solid", "Svelte", "Vue", "Preact"]

export default function Page() {
  const service = useMachine(field.machine, {
    id: useId(),
    required: true,
  })

  const api = field.connect(service, normalizeProps)

  return (
    <>
      <main className="field-page">
        <h1>Field — Select</h1>
        <form onSubmit={(e) => e.preventDefault()}>
          <div {...api.getRootProps()}>
            <label {...api.getLabelProps()}>
              Framework <span {...api.getIndicatorProps({ type: "required" })}>*</span>
            </label>
            <select {...api.getSelectProps()}>
              <option value="">Select a framework…</option>
              {frameworks.map((framework) => (
                <option key={framework} value={framework.toLowerCase()}>
                  {framework}
                </option>
              ))}
            </select>
            <span {...api.getHelperTextProps()}>The one you reach for first.</span>
            <span {...api.getErrorTextProps()}>{api.errors[0]}</span>
          </div>
          <div className="actions">
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
