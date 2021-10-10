import { useMachine } from "@ui-machines/react"
import { accordion } from "@ui-machines/web"
import { StateVisualizer } from "components/state-visualizer"
import { useControls } from "hooks/use-controls"
import { useMount } from "hooks/use-mount"

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
    allowToggle: { type: "boolean", defaultValue: false, label: "Allow Toggle" },
    allowMultiple: { type: "boolean", defaultValue: false, label: "Allow Multiple" },
    activeId: { type: "select", defaultValue: "", options: ["home", "contact", "about"], label: "Active Id" },
  })

  const [state, send] = useMachine(accordion.machine, {
    context: controls.context,
  })

  const { rootProps, getItemProps, getPanelProps, getTriggerProps } = accordion.connect(state, send)
  const ref = useMount<HTMLDivElement>(send)

  return (
    <div className="root" style={{ width: "100%" }}>
      <controls.ui />
      <div ref={ref} {...rootProps} style={{ maxWidth: "40ch" }}>
        {data.map((item) => (
          <div key={item.id} {...getItemProps({ id: item.id })}>
            <h3>
              <button data-testid={`${item.id}:trigger`} {...getTriggerProps({ id: item.id })}>
                {item.label}
              </button>
            </h3>
            <div data-testid={`${item.id}:panel`} {...getPanelProps({ id: item.id })}>
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
