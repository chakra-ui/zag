"use client"

import * as passwordInput from "@zag-js/password-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/password-input.css"

export default function Page() {
  const [output, setOutput] = useState("")

  const service = useMachine(passwordInput.machine, {
    id: useId(),
    name: "password",
    required: true,
    autoComplete: "new-password",
  })

  const api = passwordInput.connect(service, normalizeProps)

  return (
    <>
      <main>
        <div className="password-form">
          <p className="hint">Submit empty to see the required check, then save a password.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const data = Object.fromEntries(new FormData(e.currentTarget))
              // never print a real password, even in a demo
              const masked = { ...data, password: `•••• (${String(data.password).length} characters)` }
              setOutput(JSON.stringify(masked, null, 2))
            }}
            onReset={() => setOutput("")}
          >
            <div {...api.getRootProps()}>
              <label {...api.getLabelProps()}>Password</label>
              <div {...api.getControlProps()}>
                <input {...api.getInputProps()} />
                <button {...api.getVisibilityTriggerProps()}>
                  <span {...api.getIndicatorProps()}>{api.visible ? <EyeIcon /> : <EyeOffIcon />}</span>
                </button>
              </div>
            </div>
            <div className="actions">
              <button type="submit">Save password</button>
              <button type="reset">Reset</button>
            </div>
          </form>
          {output && <pre className="output">{output}</pre>}
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
