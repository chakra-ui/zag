import * as radio from "@zag-js/radio-group"
import { radioControls, radioData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo, createUniqueId } from "solid-js"
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
          <Index each={radioData}>
            {(opt) => (
              <label data-testid={`radio-${opt().id}`} {...api().getItemProps({ value: opt().id })}>
                <span data-testid={`label-${opt().id}`} {...api().getItemTextProps({ value: opt().id })}>
                  {opt().label}
                </span>
                <input data-testid={`input-${opt().id}`} {...api().getItemHiddenInputProps({ value: opt().id })} />
              </label>
            )}
          </Index>
        </div>
        <button onClick={api().clearValue}>reset</button>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
