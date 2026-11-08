import * as radio from "@zag-js/radio-group"
import { contactMethods } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, For, Show } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/radio-group.css"

export default function Page() {
  const [value, setValue] = createSignal<string | null>(null)
  const [submitted, setSubmitted] = createSignal(false)
  const [output, setOutput] = createSignal("")

  const invalid = () => submitted() && !value()

  const service = useMachine(radio.machine, () => ({
    id: createUniqueId(),
    name: "contact",
    defaultValue: null,
    required: true,
    invalid: invalid(),
    onValueChange: (details: radio.ValueChangeDetails) => setValue(details.value),
  }))

  const api = createMemo(() => radio.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div class="radio-form">
          <p class="hint">Save without choosing to see the invalid state, then pick one.</p>
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
            <div {...api().getRootProps()}>
              <span {...api().getLabelProps()}>Preferred contact method</span>
              <For each={contactMethods}>
                {(opt) => (
                  <label data-testid={`radio-${opt.id}`} {...api().getItemProps({ value: opt.id })}>
                    <div {...api().getItemControlProps({ value: opt.id })} />
                    <span {...api().getItemTextProps({ value: opt.id })}>{opt.label}</span>
                    <input {...api().getItemHiddenInputProps({ value: opt.id })} />
                  </label>
                )}
              </For>
            </div>
            <Show when={invalid()}>
              <p class="error" role="alert">
                Choose a contact method.
              </p>
            </Show>
            <div class="actions">
              <button type="submit">Save preference</button>
              <button type="reset">Reset</button>
            </div>
          </form>
          <Show when={output()}>
            <pre class="output" data-testid="form-output">
              {output()}
            </pre>
          </Show>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
