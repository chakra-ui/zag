import { injectGlobal } from "@emotion/css"
import * as Accordion from "@ui-machines/accordion"
import { normalizeProps, PropTypes, useMachine, useSetup } from "@ui-machines/solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { accordionControls } from "../../../../shared/controls"
import { accordionData } from "../../../../shared/data"
import { accordionStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

injectGlobal(accordionStyle)

export default function Page() {
  const controls = useControls(accordionControls)

  const [state, send] = useMachine(Accordion.machine, {
    context: controls.context,
  })

  const ref = useSetup<HTMLDivElement>({ send, id: createUniqueId() })

  const accordion = createMemo(() => Accordion.connect<PropTypes>(state, send, normalizeProps))

  return (
    <>
      <controls.ui />

      <div className="accordion" ref={ref} {...accordion().rootProps}>
        <For each={accordionData}>
          {(item) => (
            <div className="accordion__item" {...accordion().getItemProps({ value: item.id })}>
              <h3>
                <button
                  className="accordion__trigger"
                  data-testid={`${item.id}:trigger`}
                  {...accordion().getTriggerProps({ value: item.id })}
                >
                  {item.label}
                </button>
              </h3>
              <div
                className="accordion__content"
                data-testid={`${item.id}:content`}
                {...accordion().getContentProps({ value: item.id })}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </div>
            </div>
          )}
        </For>
      </div>

      <StateVisualizer state={state} />
    </>
  )
}
