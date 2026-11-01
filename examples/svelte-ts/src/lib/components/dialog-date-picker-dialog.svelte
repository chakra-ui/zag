<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import * as dialog from "@zag-js/dialog"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import type { Snippet } from "svelte"

  const { children }: { children?: Snippet } = $props()

  const id = $props.id()
  const service = useMachine(dialog.machine, { id })
  const api = $derived(dialog.connect(service, normalizeProps))
</script>

<button {...api.getTriggerProps()}>Open</button>
{#if api.open}
  <Portal>
    <div {...api.getBackdropProps()}></div>
    <div {...api.getPositionerProps()}>
      <div {...api.getContentProps()}>
        {@render children?.()}
        <button {...api.getCloseTriggerProps()}>
          <XIcon />
        </button>
      </div>
    </div>
  </Portal>
{/if}
