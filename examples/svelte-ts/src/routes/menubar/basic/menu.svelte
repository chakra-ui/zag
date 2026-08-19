<script lang="ts">
  import * as menu from "@zag-js/menu"
  import { normalizeProps, portal, useMachine } from "@zag-js/svelte"
  import { getContext } from "svelte"

  interface Props {
    id: string
    label: string
    items: { value: string; label: string }[]
  }

  let { id, label, items }: Props = $props()

  const menubarContext = getContext<menu.MenubarContext | undefined>("menubar")
  const service = useMachine(menu.machine, { id, menubar: menubarContext })
  const api = $derived(menu.connect(service, normalizeProps))
</script>

<button data-testid={`${id}:trigger`} {...api.getTriggerProps()}>{label}</button>
{#if api.open}
  <div use:portal {...api.getPositionerProps()}>
    <ul data-testid={`${id}:content`} {...api.getContentProps()}>
      {#each items as item (item.value)}
        <li data-testid={item.value} {...api.getItemProps({ value: item.value })}>{item.label}</li>
      {/each}
    </ul>
  </div>
{/if}
