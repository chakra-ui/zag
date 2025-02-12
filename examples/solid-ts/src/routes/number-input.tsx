import * as numberInput from "@zag-js/number-input"
import { numberInputControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

export default function Page() {
  const controls = useControls(numberInputControls)

  const service = useMachine(numberInput.machine, { id: createUniqueId() })

  const api = createMemo(() => numberInput.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div {...api().getRootProps()}>
          <div data-testid="scrubber" {...api().getScrubberProps()} />
          <label data-testid="label" {...api().getLabelProps()}>
            Enter number:
          </label>
          <div {...api().getControlProps()}>
            <button data-testid="dec-button" {...api().getDecrementTriggerProps()}>
              DEC
            </button>
            <input data-testid="input" {...api().getInputProps()} />
            <button data-testid="inc-button" {...api().getIncrementTriggerProps()}>
              INC
            </button>
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} omit={["formatter", "parser"]} />
      </Toolbar>
    </>
  )
}
