<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toggle from "@zag-js/toggle"
  import { Volume2Icon, VolumeXIcon } from "lucide-svelte"
  import "@styles/toggle.css"

  const id = $props.id()
  const service = useMachine(toggle.machine, { id })
  const api = $derived(toggle.connect(service, normalizeProps))
</script>

<main>
  <div class="toggle-mute">
    <p class="hint">The name stays "Mute"; the pressed state tells you it's on.</p>
    <button aria-label="Mute" {...api.getRootProps()}>
      <span {...api.getIndicatorProps()}>
        {#if api.pressed}
          <VolumeXIcon class="icon" data-testid="icon-muted" />
        {:else}
          <Volume2Icon class="icon" data-testid="icon-speaker" />
        {/if}
      </span>
    </button>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
