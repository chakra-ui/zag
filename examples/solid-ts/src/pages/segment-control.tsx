import * as radio from "@zag-js/radio-group"
import { radioControls, radioData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(radioControls)

  const [state, send] = useMachine(radio.machine({ id: createUniqueId(), name: "fruit" }), {
    context: controls.context,
  })

  const api = createMemo(() => radio.connect(state, send, normalizeProps))

  return (
    <>
      <main class="segmented-control">
        <div {...api().rootProps}>
          <div {...api().indicatorProps} />
          <For each={radioData}>
            {(opt) => (
              <label data-testid={`radio-${opt.id}`} {...api().getRadioProps({ value: opt.id })}>
                <span data-testid={`label-${opt.id}`} {...api().getRadioLabelProps({ value: opt.id })}>
                  {opt.label}
                </span>
                <input data-testid={`input-${opt.id}`} {...api().getRadioHiddenInputProps({ value: opt.id })} />
              </label>
            )}
          </For>
        </div>

        <button onClick={api().clearValue}>reset</button>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
