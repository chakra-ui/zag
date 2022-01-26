import * as Accordion from "@ui-machines/accordion"
import { useMachine, useSetup } from "@ui-machines/react"
import { StateVisualizer } from "components/state-visualizer"
import { useControls } from "hooks/use-controls"

const data = [
  {
    id: "home",
    label: "Home",
  },
  {
    id: "about",
    label: "About",
  },
  {
    id: "contact",
    label: "Contact",
  },
]

export default function Page() {
  const controls = useControls({
    collapsible: { type: "boolean", defaultValue: false, label: "Allow Toggle" },
    multiple: { type: "boolean", defaultValue: false, label: "Allow Multiple" },
    value: { type: "select", defaultValue: "", options: ["home", "about", "contact"], label: "Active Id" },
  })

  const [state, send] = useMachine(Accordion.machine, {
    context: controls.context,
  })

  const { rootProps, getItemProps, getContentProps, getTriggerProps } = Accordion.connect(state, send)
  const ref = useSetup<HTMLDivElement>({ send, id: "12" })

  return (
    <div className="root" style={{ width: "100%" }}>
      <controls.ui />
      <div ref={ref} {...rootProps} style={{ maxWidth: "40ch" }}>
        {data.map((item) => (
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
