<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as clipboard from "@zag-js/clipboard"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ClipboardCheckIcon, ClipboardCopyIcon } from "lucide-svelte"
  import "@styles/clipboard.css"

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  const generateKey = () =>
    "zag_live_" + Array.from({ length: 24 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("")

  let value = $state("zag_live_51Hx8Kq2eZvKGdY4Tn9PzLm3W")
  let status = $state("")

  const id = $props.id()
  const service = useMachine(clipboard.machine, () => ({
    id,
    value,
    onStatusChange: (details) => (status = details.copied ? "Copied!" : ""),
  }))

  const api = $derived(clipboard.connect(service, normalizeProps))
</script>

<main>
  <div class="api-key">
    <div {...api.getRootProps()}>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label {...api.getLabelProps()}>Secret API key</label>
      <div {...api.getControlProps()}>
        <input {...api.getInputProps()} />
        <button {...api.getTriggerProps()}>
          {#if api.copied}
            <ClipboardCheckIcon />
          {:else}
            <ClipboardCopyIcon />
          {/if}
        </button>
      </div>
      <div class="actions">
        <button
          type="button"
          onclick={() => {
            value = generateKey()
            status = ""
          }}
        >
          Regenerate
        </button>
        <span data-testid="status">{status}</span>
      </div>
    </div>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
