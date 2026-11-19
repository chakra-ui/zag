import { normalizeProps, useMachine } from "@zag-js/solid"
import * as toggle from "@zag-js/toggle"
import { HeartIcon } from "lucide-solid"
import { createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/toggle.css"

export default function Page() {
  const id = createUniqueId()
  const [saved, setSaved] = createSignal(false)

  const service = useMachine(toggle.machine, () => ({
    id,
    pressed: saved(),
    onPressedChange: setSaved,
  }))
  const api = createMemo(() => toggle.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div class="toggle-favorite">
          <p class="hint">Save the recipe, then use Reset to clear it from outside.</p>
          <div class="row">
            <button aria-label="Save recipe" {...api().getRootProps()}>
              <span {...api().getIndicatorProps()}>
                <HeartIcon class="icon" />
              </span>
            </button>
            <span class="count" data-testid="saved-count">
              Saved by {saved() ? 129 : 128} people
            </span>
          </div>
          <button type="button" onClick={() => setSaved(false)}>
            Reset
          </button>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
