<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toggle from "@zag-js/toggle"
  import { HeartIcon } from "lucide-svelte"
  import "@styles/toggle.css"

  const id = $props.id()
  let saved = $state(false)

  const service = useMachine(toggle.machine, () => ({
    id,
    pressed: saved,
    onPressedChange: (pressed) => (saved = pressed),
  }))
  const api = $derived(toggle.connect(service, normalizeProps))
</script>

<main>
  <div class="toggle-favorite">
    <p class="hint">Save the recipe, then use Reset to clear it from outside.</p>
    <div class="row">
      <button aria-label="Save recipe" {...api.getRootProps()}>
        <span {...api.getIndicatorProps()}>
          <HeartIcon class="icon" />
        </span>
      </button>
      <span class="count" data-testid="saved-count">Saved by {saved ? 129 : 128} people</span>
    </div>
    <button type="button" onclick={() => (saved = false)}>Reset</button>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
