<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as clipboard from "@zag-js/clipboard"
  import { clipboardControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ClipboardCheckIcon, ClipboardCopyIcon } from "lucide-svelte"

  const controls = useControls(clipboardControls)

  const [snapshot, send] = useMachine(
    clipboard.machine({
      id: "1",
      value: "https://github/com/chakra-ui/zag",
    }),
    {
      context: controls.context,
    },
  )

  const api = $derived(clipboard.connect(snapshot, send, normalizeProps))
</script>

<main class="clipboard">
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>Copy this link</label>
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
    <div {...api.getIndicatorProps({ copied: true })}>Copied!</div>
    <div {...api.getIndicatorProps({ copied: false })}>Copy</div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={snapshot} />
</Toolbar>
