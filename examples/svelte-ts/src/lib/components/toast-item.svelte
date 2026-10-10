<script lang="ts">
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toast from "@zag-js/toast"
  import { XIcon } from "lucide-svelte"

  interface Props {
    actor: toast.Props
    parent: toast.GroupService
    index: number
  }

  const { actor, parent, index }: Props = $props()
  const computedProps = $derived({
    ...actor,
    parent,
    index,
  })

  const service = useMachine(toast.machine, () => computedProps)
  const api = $derived(toast.connect(service, normalizeProps))
</script>

<div {...api.getRootProps()}>
  <div {...api.getGhostBeforeProps()}></div>
  <div data-scope="toast" data-part="progressbar"></div>
  <div data-scope="toast" data-part="content" style="display: grid; gap: 8px; width: 100%; padding-right: 16px">
    <div {...api.getTitleProps()}>{api.title}</div>
    <div {...api.getDescriptionProps()}>{api.description}</div>
    {#if actor.action}
      <button {...api.getActionTriggerProps()}>{actor.action.label}</button>
    {/if}
    <button {...api.getCloseTriggerProps()}>
      <XIcon />
    </button>
  </div>
  <div {...api.getGhostAfterProps()}></div>
</div>
