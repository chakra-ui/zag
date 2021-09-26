import { accordion } from "@ui-machines/web"
import { useMachine } from "@ui-machines/react"

import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"

function Page() {
  const [state, send] = useMachine(accordion.machine)

  const ref = useMount<HTMLDivElement>(send)

  const { rootProps, getAccordionItem } = accordion.connect(state, send)

  const home = getAccordionItem({ id: "home" })
  const about = getAccordionItem({ id: "about" })
  const contact = getAccordionItem({ id: "contact" })

  return (
    <div style={{ width: "100%" }}>
      <div ref={ref} {...rootProps} style={{ maxWidth: "40ch" }}>
        <div {...home.groupProps}>
          <h3>
            <button {...home.triggerProps}>Home</button>
          </h3>
          <div {...home.panelProps}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
          </div>
        </div>

        <div {...about.groupProps}>
          <h3>
            <button {...about.triggerProps}>About</button>
          </h3>
          <div {...about.panelProps}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
          </div>
        </div>

        <div {...contact.groupProps}>
          <h3>
            <button {...contact.triggerProps}>Contact</button>
          </h3>
          <div {...contact.panelProps}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
          </div>
        </div>
      </div>

      <StateVisualizer state={state} />
    </div>
  )
}

export default Page
