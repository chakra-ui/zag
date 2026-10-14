<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import * as dialog from "@zag-js/dialog"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"

  interface Props extends Omit<dialog.Props, "id"> {}

  const dialogProps: Props = $props()

  const id = $props.id()
  const service = useMachine(dialog.machine, () => ({ id, ...dialogProps }))
  const api = $derived(dialog.connect(service, normalizeProps))
</script>

<button {...api.getTriggerProps()}>Open Dialog</button>
{#if api.open}
  <Portal>
    <div {...api.getBackdropProps()}></div>
    <div {...api.getPositionerProps()}>
      <div {...api.getContentProps()}>
        <h2 {...api.getTitleProps()}>Edit profile</h2>
        <p {...api.getDescriptionProps()}>Make changes to your profile here. Click save when you are done.</p>
        <div>
          <input placeholder="Enter name..." />
          <button>Save</button>
        </div>
        <button {...api.getCloseTriggerProps()}>
          <XIcon />
        </button>
      </div>
    </div>
  </Portal>
{/if}
