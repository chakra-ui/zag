import { normalizeProps } from "@zag-js/react"
import { accordionControls, accordionData } from "@zag-js/shared"
import { useEffect, useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"
import { useActor } from "@xstate/react"
import { accordionConnect, accordionMachine } from "../machines/accordion/accordion.machine"

export default function Page() {
  const controls = useControls(accordionControls)

  const [state, send] = useActor(accordionMachine, {
    input: { ...controls.context, id: useId() },
  })

  useEffect(() => {
    send({ type: "CONTEXT.SYNC", updatedContext: controls.context })
  }, [controls.context, send])

  const api = accordionConnect(state, send, normalizeProps)

  return (
    <>
      <main className="accordion">
        <div {...api.rootProps}>
          {accordionData.map((item) => (
            <div key={item.id} {...api.getItemProps({ value: item.id })}>
              <h3>
                <button data-testid={`${item.id}:trigger`} {...api.getItemTriggerProps({ value: item.id })}>
                  {item.label}
                  <div {...api.getItemIndicatorProps({ value: item.id })}>{">"}</div>
                </button>
              </h3>
              <div data-testid={`${item.id}:content`} {...api.getItemContentProps({ value: item.id })}>
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
