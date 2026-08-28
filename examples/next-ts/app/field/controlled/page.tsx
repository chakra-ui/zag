"use client"

import * as field from "@zag-js/field"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/field.css"

export default function Page() {
  const [dirty, setDirty] = useState(false)
  const [touched, setTouched] = useState(false)

  const service = useMachine(field.machine, {
    id: useId(),
    required: true,
    dirty,
    touched,
  })

  const api = field.connect(service, normalizeProps)

  return (
    <>
      <main className="field-page">
        <h1>Field — Controlled</h1>
        <div className="options">
          <label>
            <input type="checkbox" checked={dirty} onChange={(e) => setDirty(e.currentTarget.checked)} />
            Dirty
          </label>
          <label>
            <input type="checkbox" checked={touched} onChange={(e) => setTouched(e.currentTarget.checked)} />
            Touched
          </label>
        </div>
        <form onSubmit={(e) => e.preventDefault()}>
          <div {...api.getRootProps()}>
            <label {...api.getLabelProps()}>
              Username <span {...api.getIndicatorProps({ type: "required" })}>*</span>
            </label>
            <input {...api.getInputProps()} placeholder="e.g. sage" />
            <span {...api.getHelperTextProps()}>
              Dirty and touched are owned by the parent. Typing will not flip them.
            </span>
            <span {...api.getErrorTextProps()}>{api.errors[0] ?? "Field is invalid"}</span>
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
