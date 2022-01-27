import * as Accordion from "@ui-machines/accordion"
import { useMachine, useSetup } from "@ui-machines/react"
import { accordionControls } from "../../../shared/controls"
import { accordionData } from "../../../shared/data"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(accordionControls)

  const [state, send] = useMachine(Accordion.machine, {
    context: controls.context,
  })

  const ref = useSetup<HTMLDivElement>({ send, id: "1" })

  const { rootProps, getItemProps, getContentProps, getTriggerProps } = Accordion.connect(state, send)

  return (
    <div className="root" style={{ width: "100%" }}>
      <controls.ui />
      <div ref={ref} {...rootProps} style={{ maxWidth: "40ch" }}>
        {accordionData.map((item) => (
          <div key={item.id} {...getItemProps({ value: item.id })}>
            <h3>
              <button data-testid={`${item.id}:trigger`} {...getTriggerProps({ value: item.id })}>
                {item.label}
              </button>
            </h3>
            <div data-testid={`${item.id}:content`} {...getContentProps({ value: item.id })}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua.
            </div>
          </div>
        ))}
      </div>

      <StateVisualizer state={state} />
    </div>
  )
}
