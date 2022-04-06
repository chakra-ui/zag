import { Global } from "@emotion/react"
import * as accordion from "@zag-js/accordion"
import { useMachine, useSetup } from "@zag-js/react"
import { accordionControls } from "../../../shared/controls"
import { accordionData } from "../../../shared/data"
import { accordionStyle } from "../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(accordionControls)

  const [state, send] = useMachine(accordion.machine, {
    context: controls.context,
  })

  const ref = useSetup({ send, id: "1" })

  const api = accordion.connect(state, send)

  return (
    <>
      <Global styles={accordionStyle} />
      <controls.ui />

      <div ref={ref} {...api.rootProps}>
        {accordionData.map((item) => (
          <div key={item.id} {...api.getItemProps({ value: item.id })}>
            <h3>
              <button data-testid={`${item.id}:trigger`} {...api.getTriggerProps({ value: item.id })}>
                {item.label}
              </button>
            </h3>
            <div data-testid={`${item.id}:content`} {...api.getContentProps({ value: item.id })}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua.
            </div>
          </div>
        ))}
      </div>

      <StateVisualizer state={state} />
    </>
  )
}
