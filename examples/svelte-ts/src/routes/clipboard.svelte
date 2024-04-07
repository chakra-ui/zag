<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as clipboard from "@zag-js/clipboard"
  import { clipboardControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ClipboardCheckIcon, ClipboardCopyIcon } from "lucide-svelte"

  const controls = useControls(clipboardControls)

  const [_state, send] = useMachine(
    clipboard.machine({
      id: "1",
      value: "https://github/com/chakra-ui/zag",
    }),
    {
      context: controls.context,
    },
  )

  const api = $derived(clipboard.connect(_state, send, normalizeProps))
</script>

<main class="clipboard">
  <div {...api.rootProps}>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label {...api.labelProps}>Copy this link</label>
    <div {...api.controlProps}>
      <input {...api.inputProps} />
      <button {...api.triggerProps}>
        {#if api.isCopied}
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
  <StateVisualizer state={_state} />
</Toolbar>
