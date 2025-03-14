import * as radio from "@zag-js/radio-group"
import { radioControls, radioData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

export default function Page() {
  const controls = useControls(radioControls)

  const service = useMachine(
    radio.machine,
    controls.mergeProps<radio.Props>({
      id: createUniqueId(),
      name: "fruit",
      orientation: "horizontal",
    }),
  )

  const api = createMemo(() => radio.connect(service, normalizeProps))

  return (
    <>
      <main class="segmented-control">
        <div {...api().getRootProps()}>
          <div {...api().getIndicatorProps()} />
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

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
