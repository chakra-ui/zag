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
          <p className="hint">The name stays "Mute"; the pressed state tells you it's on.</p>
          <button aria-label="Mute" {...api.getRootProps()}>
            <span {...api.getIndicatorProps()}>
              {api.pressed ? (
                <VolumeXIcon className="icon" data-testid="icon-muted" />
              ) : (
                <Volume2Icon className="icon" data-testid="icon-speaker" />
              )}
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
