import * as pinInput from "@zag-js/pin-input"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, For, Show } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/pin-input.css"

export default function Page() {
  const [rejected, setRejected] = createSignal(false)
  const [output, setOutput] = createSignal("")

  const service = useMachine(pinInput.machine, {
    id: createUniqueId(),
    name: "invite",
    count: 6,
    type: "alphanumeric",
    autoSubmit: true,
    normalizeValue: (value) => value.toUpperCase(),
    translations: { inputLabel: (index, length) => `Character ${index + 1} of ${length}` },
    onValueChange: () => setRejected(false),
    onValueInvalid: () => setRejected(true),
  })
  const api = createMemo(() => pinInput.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div class="pin-input-invite-code">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              const data = new FormData(event.currentTarget)
              setOutput([...data.entries()].map(([key, value]) => `${key}=${value}`).join("\n"))
            }}
          >
            <div {...api().getRootProps()}>
              <label {...api().getLabelProps()}>Invite code</label>
              <div {...api().getControlProps()}>
                <For each={api().items}>
                  {(index) => (
                    <>
                      <Show when={index === 3}>
                        <span class="separator" aria-hidden="true">
                          –
                        </span>
                      </Show>
                      <input {...api().getInputProps({ index })} />
                    </>
                  )}
                </For>
              </div>
              <input {...api().getHiddenInputProps()} />
            </div>
            <Show when={rejected()}>
              <p class="error" role="alert">
                Use letters and numbers only
              </p>
            </Show>
            <button type="submit">Join team</button>
          </form>
          <Show when={output()}>
            <pre data-testid="form-output">{output()}</pre>
          </Show>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} context={["value", "focusedIndex"]} />
      </Toolbar>
    </>
  )
}
