import { accordion } from "@ui-machines/web"
import { normalizeProps, useMachine, useSetup } from "@ui-machines/solid"

import { createMemo } from "solid-js"

import { StateVisualizer } from "../components/state-visualizer"

export default function Page() {
  const [state, send] = useMachine(accordion.machine)

  const ref = useSetup<HTMLDivElement>({ send, id: "accordion" })

  const connect = createMemo(() => accordion.connect(state, send, normalizeProps))

  const parts = createMemo(() => ({
    home: connect().getAccordionItem({ id: "home" }),
    about: connect().getAccordionItem({ id: "about" }),
    contact: connect().getAccordionItem({ id: "contact" }),
  }))

  return (
    <div style={{ width: "100%" }}>
      <div ref={ref} {...connect().rootProps} style={{ maxWidth: "40ch" }}>
        <div {...parts().home.groupProps}>
          <h3>
            <button {...parts().home.triggerProps}>Home</button>
          </h3>
          <div {...parts().home.panelProps}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
          </div>
        </div>

        <div {...parts().about.groupProps}>
          <h3>
            <button {...parts().about.triggerProps}>About</button>
          </h3>
          <div {...parts().about.panelProps}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
          </div>
        </div>

        <div {...parts().contact.groupProps}>
          <h3>
            <button {...parts().contact.triggerProps}>Contact</button>
          </h3>
          <div {...parts().contact.panelProps}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
          </div>
        </div>

        <StateVisualizer state={state} />
      </div>
    </div>
  )
}
