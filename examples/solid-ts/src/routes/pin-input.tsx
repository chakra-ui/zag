import * as pinInput from "@zag-js/pin-input"
import { pinInputControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import serialize from "form-serialize"
import { createMemo, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

export default function Page() {
  const controls = useControls(pinInputControls)

  const service = useMachine(
    pinInput.machine,
    controls.mergeProps({
      id: createUniqueId(),
      name: "test",
      count: 3,
    }),
  )

  const api = createMemo(() => pinInput.connect(service, normalizeProps))

  return (
    <>
      <main class="pin-input">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const formData = serialize(e.currentTarget, { hash: true })
            console.log(formData)
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
          <button data-testid="clear-button" onClick={api().clearValue}>
            Clear
          </button>
        </form>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
