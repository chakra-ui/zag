<script lang="ts">
  import * as menu from "@zag-js/menu"
  import { menuData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { onMount } from "svelte"
  import Portal from "./portal.svelte"

  const id = $props.id()

  const service = useMachine(menu.machine, { id })
  const root = $derived(menu.connect(service, normalizeProps))

  const subService = useMachine(menu.machine, { id: `${id}-sub` })
  const sub = $derived(menu.connect(subService, normalizeProps))

  const sub2Service = useMachine(menu.machine, { id: `${id}-sub2` })
  const sub2 = $derived(menu.connect(sub2Service, normalizeProps))

  onMount(() => {
    root.setChild(subService)
    sub.setParent(service)
    sub.setChild(sub2Service)
    sub2.setParent(subService)
  })

  const triggerItemProps = $derived(root.getTriggerItemProps(sub))
  const triggerItem2Props = $derived(sub.getTriggerItemProps(sub2))

  const [level1, level2, level3] = menuData
</script>

<div>
  <button {...root.getTriggerProps()}>Options Menu</button>

  {#if root.open}
    <Portal>
      <div {...root.getPositionerProps()}>
        <ul {...root.getContentProps()}>
          {#each level1 as item (item.value)}
            {@const props = item.trigger ? triggerItemProps : root.getItemProps({ value: item.value })}
            <li {...props}>{item.label}</li>
          {/each}
        </ul>
      </div>
    </Portal>
  {/if}

  {#if sub.open}
    <Portal>
      <div {...sub.getPositionerProps()}>
        <ul {...sub.getContentProps()}>
          {#each level2 as item (item.value)}
            {@const props = item.trigger ? triggerItem2Props : sub.getItemProps({ value: item.value })}
            <li {...props}>{item.label}</li>
          {/each}
        </ul>
      </div>
    </Portal>
  {/if}

  {#if sub2.open}
    <Portal>
      <div {...sub2.getPositionerProps()}>
        <ul {...sub2.getContentProps()}>
          {#each level3 as item (item.value)}
            <li {...sub2.getItemProps({ value: item.value })}>{item.label}</li>
          {/each}
        </ul>
      </div>
    </Portal>
  {/if}
</div>
