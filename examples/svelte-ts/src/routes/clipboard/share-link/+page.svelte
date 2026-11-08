<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as clipboard from "@zag-js/clipboard"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ClipboardCheckIcon, ClipboardCopyIcon } from "lucide-svelte"
  import "@styles/clipboard.css"

  const id = $props.id()
  const service = useMachine(clipboard.machine, {
    id,
    value: "https://zagjs.com/components/react/clipboard",
    timeout: 1500,
    translations: { triggerLabel: (copied) => (copied ? "Link copied" : "Copy link") },
  })

  const api = $derived(clipboard.connect(service, normalizeProps))
</script>

<main>
  <div class="share-link">
    <div {...api.getRootProps()}>
      <p>Anyone with this link can view the Clipboard docs.</p>
      <button {...api.getTriggerProps()}>
        {#if api.copied}
          <ClipboardCheckIcon />
        {:else}
          <ClipboardCopyIcon />
        {/if}
        <span>{api.copied ? "Link copied" : "Copy link"}</span>
      </button>
    </div>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
