<script lang="ts">
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toast from "@zag-js/toast"
  import { XIcon } from "lucide-svelte"
  import type { Snippet } from "svelte"

  interface Props {
    actor: toast.Options<any>
    parent: toast.GroupService
    index: number
  }

  const { actor, parent, index }: Props = $props()

  const service = useMachine(toast.machine, () => ({ ...actor, parent, index }))
  const api = $derived(toast.connect(service, normalizeProps))
</script>

<!-- Title and description may be strings or snippets -->
{#snippet content(value: string | Snippet | undefined)}
  {#if typeof value === "function"}{@render value()}{:else}{value}{/if}
{/snippet}

<div {...api.getRootProps()}>
  <span {...api.getGhostBeforeProps()}></span>
  <div data-scope="toast" data-part="progressbar"></div>
  <div data-scope="toast" data-part="content" style="display: grid; gap: 8px; width: 100%; padding-right: 16px">
    <div {...api.getTitleProps()}>
      {#if api.type === "loading"}&lt;...&gt;{/if}
      {@render content(api.title)}
    </div>
    <div {...api.getDescriptionProps()}>{@render content(api.description)}</div>
    {#if actor.action}
      <button {...api.getActionTriggerProps()}>{actor.action.label}</button>
    {/if}
    <button {...api.getCloseTriggerProps()}>
      <XIcon />
    </button>
  </div>
  <span {...api.getGhostAfterProps()}></span>
</div>
