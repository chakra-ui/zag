<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import * as popover from "@zag-js/popover"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import type { Snippet } from "svelte"

  const { trigger, children }: { trigger: string; children?: Snippet } = $props()

  const id = $props.id()
  const service = useMachine(popover.machine, { id })
  const api = $derived(popover.connect(service, normalizeProps))
</script>

<button {...api.getTriggerProps()}>{trigger}</button>
{#if api.open}
  <Portal>
    <div {...api.getPositionerProps()}>
      <div {...api.getContentProps()}>
        <div {...api.getTitleProps()}>Popover</div>
        <button {...api.getCloseTriggerProps()}>
          <XIcon />
        </button>
        <div>{@render children?.()}</div>
      </div>
    </div>
  </Portal>
{/if}
