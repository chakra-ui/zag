import { normalizeProps, useMachine } from "@zag-js/preact"
import * as toggle from "@zag-js/toggle"
import { Volume2Icon, VolumeXIcon } from "lucide-preact"
import { useId } from "preact/hooks"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/toggle.css"

export default function Page() {
  const service = useMachine(toggle.machine, { id: useId() })
  const api = toggle.connect(service, normalizeProps)

  return (
    <>
      <main>
        <div className="toggle-mute">
          <button aria-label="Mute" {...api.getRootProps()}>
            <span {...api.getIndicatorProps()}>
              {api.pressed ? <VolumeXIcon className="icon" /> : <Volume2Icon className="icon" />}
            </span>
          </button>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
