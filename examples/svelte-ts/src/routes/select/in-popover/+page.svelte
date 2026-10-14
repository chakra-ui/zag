<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import SelectNested from "$lib/components/select-nested.svelte"
  import * as popover from "@zag-js/popover"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import "@styles/select.css"
  import "@styles/popover.css"

  const id = $props.id()
  const service = useMachine(popover.machine, {
    id,
    modal: false,
  })
  const api = $derived(popover.connect(service, normalizeProps))
</script>

<div style="padding: 20px">
  <button {...api.getTriggerProps()}>Open Popover</button>
  {#if api.open}
    <Portal>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <div {...api.getTitleProps()}>Select in Popover</div>
          <div>
            <SelectNested />
          </div>
          <button {...api.getCloseTriggerProps()}>
            <XIcon />
          </button>
        </div>
      </div>
    </Portal>
  {/if}
</div>
