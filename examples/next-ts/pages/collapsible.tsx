import * as collapsible from "@zag-js/collapsible"
import { normalizeProps, useMachine } from "@zag-js/react"
import { collapsibleControls } from "@zag-js/shared"
import { ChevronDownIcon } from "lucide-react"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(collapsibleControls)

  const service = useMachine(collapsible.machine, {
    id: useId(),
    ...controls.context,
  })

  const api = collapsible.connect(service, normalizeProps)

  return (
    <>
      <main className="collapsible">
        <div {...api.getRootProps()}>
          <button {...api.getTriggerProps()}>
            Collapsible Trigger
            <div {...api.getIndicatorProps()}>
              <ChevronDownIcon />
            </div>
          </button>
          <div {...api.getContentProps()}>
            <p>
              Lorem dfd dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna sfsd. Ut enim ad minimdfd v eniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
              ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
              fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum. <a href="#">Some Link</a>
            </p>
          </div>
        </div>

        <div>
          <div>Toggle Controls</div>
          <button onClick={() => api.setOpen(true)}>Open</button>
          <button onClick={() => api.setOpen(false)}>Close</button>
        </div>
      </main>

      <Toolbar controls={controls.ui} viz>
        <StateVisualizer state={service} omit={["stylesRef"]} />
      </Toolbar>
    </>
  )
}
