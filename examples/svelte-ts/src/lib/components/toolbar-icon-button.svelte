<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import type * as toolbar from "@zag-js/toolbar"
  import * as tooltip from "@zag-js/tooltip"
  import type { Snippet } from "svelte"

  interface Props {
    api: toolbar.Api
    value: string
    label: string
    children: Snippet
  }

  const { api, value, label, children }: Props = $props()

  const id = $props.id()
  const service = useMachine(tooltip.machine, () => ({
    id,
    ids: { trigger: api.getItemId(value) },
    disabled: api.disabled,
  }))
  const tooltipApi = $derived(tooltip.connect(service, normalizeProps))
</script>

<button
  class="toolbar-icon-only"
  {...mergeProps(tooltipApi.getTriggerProps(), api.getItemProps({ value }))}
  aria-label={label}
>
  {@render children()}
</button>
{#if tooltipApi.open}
  <Portal>
    <div {...tooltipApi.getPositionerProps()}>
      <div {...tooltipApi.getContentProps()}>{label}</div>
    </div>
  </Portal>
{/if}
