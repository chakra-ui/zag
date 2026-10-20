<script lang="ts">
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toast from "@zag-js/toast"
  import { CircleCheck, CircleX, Info, LoaderCircle, TriangleAlert, XIcon } from "lucide-svelte"
  import type { Snippet } from "svelte"

  const icons: Record<string, typeof Info> = {
    success: CircleCheck,
    error: CircleX,
    warning: TriangleAlert,
    info: Info,
    loading: LoaderCircle,
  }

  interface Props {
    actor: toast.Options<any>
    parent: toast.GroupService
    index: number
  }

  const { actor, parent, index }: Props = $props()

  const service = useMachine(toast.machine, () => ({ ...actor, parent, index }))
  const api = $derived(toast.connect(service, normalizeProps))
  const Icon = $derived(icons[api.type])
</script>

<!-- Title and description may be strings or snippets -->
{#snippet content(value: string | Snippet | undefined)}
  {#if typeof value === "function"}{@render value()}{:else}{value}{/if}
{/snippet}

<div {...api.getRootProps()}>
  <span {...api.getGhostBeforeProps()}></span>
  <div data-scope="toast" data-part="progressbar"></div>
  {#if Icon}
    <span data-scope="toast" data-part="indicator">
      <Icon />
    </span>
  {/if}
  <div data-scope="toast" data-part="content">
    {#if api.title}
      <div {...api.getTitleProps()}>{@render content(api.title)}</div>
    {/if}
    {#if api.description}
      <div {...api.getDescriptionProps()}>{@render content(api.description)}</div>
    {/if}
  </div>
  {#if actor.action}
    <button {...api.getActionTriggerProps()}>{actor.action.label}</button>
  {/if}
  {#if api.closable}
    <button {...api.getCloseTriggerProps()}>
      <XIcon />
    </button>
  {/if}
  <span {...api.getGhostAfterProps()}></span>
</div>
