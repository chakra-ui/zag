import * as pinInput from "@zag-js/pin-input"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"

export default function Page() {
  const [value, setValue] = createSignal(["", "", ""])

  const service = useMachine(pinInput.machine, () => ({
    id: createUniqueId(),
    name: "test",
    count: 3,
    value: value(),
    onValueChange(details) {
      setValue(details.value)
    },
  }))

  const api = createMemo(() => pinInput.connect(service, normalizeProps))

  return (
    <>
      <main class="pin-input">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            console.log("submitted:", value().join(""))
          }}
        >
          <div {...api().getRootProps()}>
            <label {...api().getLabelProps()}>Enter code:</label>
            <div {...api().getControlProps()}>
              <For each={api().items}>
                {(index) => <input data-testid={`input-${index + 1}`} {...api().getInputProps({ index })} />}
              </For>
            </div>
            <input {...api().getHiddenInputProps()} />
          </div>

          <div style={{ display: "flex", gap: "0.5rem", "margin-top": "0.5rem" }}>
            <button type="button" data-testid="clear-button" onClick={api().clearValue}>
              Clear
            </button>
            <button type="button" onClick={api().focus}>
              Focus
            </button>
            <button type="button" data-testid="set-value" onClick={() => setValue(["1", "2", "3"])}>
              Set 1-2-3
            </button>
            <button type="button" data-testid="reset-value" onClick={() => setValue(["", "", ""])}>
              Reset
            </button>
          </div>
        </form>
      </main>

      <Toolbar>
        <StateVisualizer state={service} context={["value", "focusedIndex"]} />
      </Toolbar>
    </>
  )
}
