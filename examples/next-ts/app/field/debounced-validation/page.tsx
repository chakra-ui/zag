"use client"

import * as field from "@zag-js/field"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useRef, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/field.css"

const TAKEN_EMAILS = ["taken@example.com"]

const checkEmail = (value: string) => (TAKEN_EMAILS.includes(value) ? "This email is already taken" : null)

export default function Page() {
  const [calls, setCalls] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const service = useMachine(field.machine, {
    id: useId(),
    required: true,
    validationMode: "onChange",
    // Debounce by returning a promise and resetting the timer. The machine drops stale resolutions.
    validate({ value }) {
      return new Promise((resolve) => {
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
          setCalls((n) => n + 1)
          resolve(checkEmail(value))
        }, 400)
      })
    },
  })

  const api = field.connect(service, normalizeProps)

  return (
    <>
      <main className="field-page">
        <h1>Field — Debounced Validation</h1>
        <form onSubmit={(e) => e.preventDefault()}>
          <div {...api.getRootProps()}>
            <label {...api.getLabelProps()}>
              Email <span {...api.getIndicatorProps({ type: "required" })}>*</span>
            </label>
            <input {...api.getInputProps()} placeholder="taken@example.com is taken" />
            <span {...api.getHelperTextProps()}>Validation runs 400ms after you stop typing.</span>
            <span {...api.getErrorTextProps()}>{api.errors[0]}</span>
            <span {...api.getIndicatorProps({ type: "valid" })}>Looks good</span>
          </div>
          {api.validating && <span data-testid="validating">Checking…</span>}
          <span data-testid="validate-calls">Checks: {calls}</span>
          <div className="actions">
            <button type="submit">Submit</button>
            <button
              type="reset"
              onClick={() => {
                clearTimeout(timerRef.current)
                setCalls(0)
              }}
            >
              Reset
            </button>
          </div>
        </form>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
