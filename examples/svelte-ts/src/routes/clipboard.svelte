<script lang="ts">
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as clipboard from "@zag-js/clipboard"
  import { clipboardControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ClipboardCheckIcon, ClipboardCopyIcon } from "lucide-svelte"
  import { unstate } from "svelte"

  const controls = useControls(clipboardControls)

  const machine = useMachine(
    clipboard.machine({
      id: "1",
      value: "https://github/com/chakra-ui/zag",
    }),
    {
      context: controls.context,
    },
  )

  const api = $derived(clipboard.connect(unstate(machine.state), machine.send, normalizeProps))
</script>

<main class="clipboard">
  <div {...api.rootProps}>
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

<Toolbar {controls} state={machine.state} />
