import { accordion } from "@ui-machines/web"
import { normalizeProps, useMachine, useSetup } from "@ui-machines/solid"

import { createMemo } from "solid-js"

import { StateVisualizer } from "../components/state-visualizer"

export default function Page() {
  const [state, send] = useMachine(accordion.machine)
  const ref = useSetup<HTMLDivElement>({ send, id: "123" })
  const connect = createMemo(() => accordion.connect(state, send, normalizeProps))

  return (
    <div style={{ width: "100%" }}>
      <div ref={ref} {...connect().rootProps} style={{ maxWidth: "40ch" }}>
        <div {...connect().getItemProps({ id: "home" })}>
          <h3>
            <button {...connect().getTriggerProps({ id: "home" })}>Home</button>
          </h3>
          <div {...connect().getPanelProps({ id: "home" })}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
          </div>
        </div>

        <div {...connect().getItemProps({ id: "about" })}>
          <h3>
            <button {...connect().getTriggerProps({ id: "about" })}>About</button>
          </h3>
          <div {...connect().getPanelProps({ id: "about" })}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
          </div>
        </div>

        <div {...connect().getItemProps({ id: "contact" })}>
          <h3>
            <button {...connect().getTriggerProps({ id: "contact" })}>Contact</button>
          </h3>
          <div {...connect().getPanelProps({ id: "contact" })}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
          </div>
        </div>
      </div>

      <StateVisualizer state={state} />
    </div>
  )
}
