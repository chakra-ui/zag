"use client"

import * as pinInput from "@zag-js/pin-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { Fragment, useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/pin-input.css"

export default function Page() {
  const [rejected, setRejected] = useState(false)
  const [output, setOutput] = useState("")

  const service = useMachine(pinInput.machine, {
    id: useId(),
    name: "invite",
    count: 6,
    type: "alphanumeric",
    autoSubmit: true,
    normalizeValue: (value) => value.toUpperCase(),
    translations: { inputLabel: (index, length) => `Character ${index + 1} of ${length}` },
    onValueChange: () => setRejected(false),
    onValueInvalid: () => setRejected(true),
  })
  const api = pinInput.connect(service, normalizeProps)

  return (
    <>
      <main>
        <div className="pin-input-invite-code">
          <p className="hint">
            Enter the 6-character code from your invite. It joins as soon as the last box is filled.
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              const data = new FormData(event.currentTarget)
              setOutput([...data.entries()].map(([key, value]) => `${key}=${value}`).join("\n"))
            }}
          >
            <div {...api.getRootProps()}>
              <label {...api.getLabelProps()}>Invite code</label>
              <div {...api.getControlProps()}>
                {api.items.map((index) => (
                  <Fragment key={index}>
                    {index === 3 && (
                      <span className="separator" aria-hidden="true">
                        –
                      </span>
                    )}
                    <input {...api.getInputProps({ index })} />
                  </Fragment>
                ))}
              </div>
              <input {...api.getHiddenInputProps()} />
            </div>
            {rejected && (
              <p className="error" role="alert">
                Use letters and numbers only
              </p>
            )}
            <button type="submit">Join team</button>
          </form>
          {output && <pre data-testid="form-output">{output}</pre>}
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} context={["value", "focusedIndex"]} />
      </Toolbar>
    </>
  )
}
