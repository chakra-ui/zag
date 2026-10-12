<script lang="ts">
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toast from "@zag-js/toast"
  import { XIcon } from "lucide-svelte"

  interface Props {
    actor: toast.Options<string>
    parent: toast.GroupService
    index: number
    showTitle: boolean
    showDescription: boolean
  }

  const { actor, parent, index, showTitle, showDescription }: Props = $props()
  const service = useMachine(toast.machine, () => ({ ...actor, parent, index }))
  const api = $derived(toast.connect(service, normalizeProps))
</script>

<div {...api.getRootProps()}>
  <div style="flex: 1">
    <p>Your draft is ready.</p>
    {#if showTitle}
      <div {...api.getTitleProps()}>{api.title}</div>
    {/if}
    {#if showDescription}
      <div {...api.getDescriptionProps()}>{api.description}</div>
    {/if}
  </div>
  <button {...api.getCloseTriggerProps()}>
    <XIcon />
  </button>
</div>
