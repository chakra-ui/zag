import * as Accordion from "@ui-machines/accordion"
import { normalizeProps, useMachine, useSetup, SolidPropTypes } from "@ui-machines/solid"
import { createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls({
    collapsible: { type: "boolean", defaultValue: false, label: "Allow Toggle" },
    multiple: { type: "boolean", defaultValue: false, label: "Allow Multiple" },
    value: { type: "select", defaultValue: "", options: ["home", "about", "contact"], label: "Active Id" },
  })

  const [state, send] = useMachine(Accordion.machine, {
    context: controls.context,
  })

  const ref = useSetup<HTMLDivElement>({ send, id: createUniqueId() })

  const connect = createMemo(() => Accordion.connect<SolidPropTypes>(state, send, normalizeProps))

  return (
    <div style={{ width: "100%" }}>
      <controls.ui />
      <div ref={ref} {...connect().rootProps} style={{ maxWidth: "40ch" }}>
        <span {...connect().getItemProps({ value: "home" })}>
          <h3>
            <button {...connect().getTriggerProps({ value: "home" })}>Home</button>
          </h3>
          <div {...connect().getContentProps({ value: "home" })}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
          </div>
        </span>

        <div {...connect().getItemProps({ value: "about" })}>
          <h3>
            <button {...connect().getTriggerProps({ value: "about" })}>About</button>
          </h3>
          <div {...connect().getContentProps({ value: "about" })}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
          </div>
        </div>

        <div {...connect().getItemProps({ value: "contact" })}>
          <h3>
            <button {...connect().getTriggerProps({ value: "contact" })}>Contact</button>
          </h3>
          <div {...connect().getContentProps({ value: "contact" })}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
          </div>
        </div>
      </div>

      <StateVisualizer state={state} />
    </div>
  )
}
