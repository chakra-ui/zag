import * as accordion from "@zag-js/accordion"
import { normalizeProps, useMachine } from "@zag-js/react"
import { accordionControls, accordionData } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"
import { ArrowRight } from "lucide-react"

export default function Page() {
  const controls = useControls(accordionControls)

  const service = useMachine(accordion.machine, {
    id: useId(),
    ...controls.context,
  })

  const api = accordion.connect(service, normalizeProps)

  return (
    <>
      <main className="accordion">
        <div {...api.getRootProps()}>
          {accordionData.map((item) => (
            <div key={item.id} {...api.getItemProps({ value: item.id })}>
              <h3>
                <button data-testid={`${item.id}:trigger`} {...api.getItemTriggerProps({ value: item.id })}>
                  {item.label}
                  <div {...api.getItemIndicatorProps({ value: item.id })}>
                    <ArrowRight />
                  </div>
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
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
