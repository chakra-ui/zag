import { normalizeProps, useMachine } from "@zag-js/solid"
import * as toggle from "@zag-js/toggle"
import { Volume2Icon, VolumeXIcon } from "lucide-solid"
import { createMemo, createUniqueId, Show } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/toggle.css"

export default function Page() {
  const service = useMachine(toggle.machine, { id: createUniqueId() })
  const api = createMemo(() => toggle.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div class="toggle-mute">
          <button aria-label="Mute" {...api().getRootProps()}>
            <span {...api().getIndicatorProps()}>
              <Show when={api().pressed} fallback={<Volume2Icon class="icon" />}>
                <VolumeXIcon class="icon" />
              </Show>
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
