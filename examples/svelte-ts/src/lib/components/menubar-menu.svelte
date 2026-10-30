<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import * as menu from "@zag-js/menu"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { getContext } from "svelte"

  interface Props {
    id: string
    label: string
    items: { value: string; label: string }[]
    positioning?: menu.Props["positioning"]
    onSelect?: menu.Props["onSelect"]
  }

  const props: Props = $props()

  const menubarContext = getContext<menu.MenubarContext | undefined>("menubar")
  const service = useMachine(menu.machine, () => ({
    id: props.id,
    menubar: menubarContext,
    positioning: props.positioning,
    onSelect: props.onSelect,
  }))
  const api = $derived(menu.connect(service, normalizeProps))
</script>

<button data-testid={`${props.id}:trigger`} {...api.getTriggerProps()}>{props.label}</button>
{#if api.open}
  <Portal>
    <div {...api.getPositionerProps()}>
      <ul data-testid={`${props.id}:content`} {...api.getContentProps()}>
        {#each props.items as item (item.value)}
          <li data-testid={item.value} {...api.getItemProps({ value: item.value })}>{item.label}</li>
        {/each}
      </ul>
    </div>
  </Portal>
{/if}
