import * as radio from "@zag-js/radio-group"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { contactMethods } from "@zag-js/shared"
import { useId, useState } from "preact/hooks"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/radio-group.css"

export default function Page() {
  const [value, setValue] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [output, setOutput] = useState("")

  const invalid = submitted && !value

  const service = useMachine(radio.machine, {
    id: useId(),
    name: "contact",
    defaultValue: null,
    required: true,
    invalid,
    onValueChange: (details) => setValue(details.value),
  })

  const api = radio.connect(service, normalizeProps)

  return (
    <>
      <main>
        <div className="radio-form">
          <p className="hint">Save without choosing to see the invalid state, then pick one.</p>
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              setSubmitted(true)
              const data = Object.fromEntries(new FormData(e.currentTarget))
              setOutput("contact" in data ? JSON.stringify(data, null, 2) : "")
            }}
            onReset={() => {
              setSubmitted(false)
              setOutput("")
            }}
          >
            <div {...api.getRootProps()}>
              <span {...api.getLabelProps()}>Preferred contact method</span>
              {contactMethods.map((opt) => (
                <label key={opt.id} data-testid={`radio-${opt.id}`} {...api.getItemProps({ value: opt.id })}>
                  <div {...api.getItemControlProps({ value: opt.id })} />
                  <span {...api.getItemTextProps({ value: opt.id })}>{opt.label}</span>
                  <input {...api.getItemHiddenInputProps({ value: opt.id })} />
                </label>
              ))}
            </div>
            {invalid && (
              <p className="error" role="alert">
                Choose a contact method.
              </p>
            )}
            <div className="actions">
              <button type="submit">Save preference</button>
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
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
