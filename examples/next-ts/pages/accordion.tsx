import { Global } from "@emotion/react"
import * as accordion from "@zag-js/accordion"
import { useMachine, useSetup } from "@zag-js/react"
import { accordionControls, accordionData, accordionStyle } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(accordionControls)

  const [state, send] = useMachine(accordion.machine, {
    context: controls.context,
  })

  const ref = useSetup({ send, id: useId() })

  const api = accordion.connect(state, send)

  return (
    <>
      <Global styles={accordionStyle} />

      <main>
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
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
