import * as Accordion from "@ui-machines/accordion"
import { normalizeProps, SolidPropTypes, useMachine, useSetup } from "@ui-machines/solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { accordionControls } from "../../../../shared/controls"
import { accordionData } from "../../../../shared/data"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(accordionControls)

  const [state, send] = useMachine(Accordion.machine, {
    context: controls.context,
  })

  const ref = useSetup<HTMLDivElement>({ send, id: createUniqueId() })

  const accordion = createMemo(() => Accordion.connect<SolidPropTypes>(state, send, normalizeProps))

  return (
    <div style={{ width: "100%" }}>
      <controls.ui />

      <div ref={ref} {...accordion().rootProps} style={{ "max-width": "40ch" }}>
        <For each={accordionData}>
          {(item) => (
            <div {...accordion().getItemProps({ value: item.id })}>
              <h3>
                <button data-testid={`${item.id}:trigger`} {...accordion().getTriggerProps({ value: item.id })}>
                  {item.label}
                </button>
              </h3>
              <div data-testid={`${item.id}:content`} {...accordion().getContentProps({ value: item.id })}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </div>
            </div>
          )}
        </For>
      </div>

      <StateVisualizer state={state} />
    </div>
  )
}
