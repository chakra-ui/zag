import { normalizeProps, useMachine } from "@zag-js/react"
import * as toggle from "@zag-js/toggle"
import { BoldIcon } from "lucide-react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const service = useMachine(toggle.machine)
  const api = toggle.connect(service, normalizeProps)

  return (
    <>
      <main className="toggle">
        <button {...api.getRootProps()}>
          <span {...api.getIndicatorProps()}>
            <BoldIcon />
          </span>
        </button>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
