<script lang="ts">
  import * as menu from "@zag-js/menu"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Portal from "$lib/components/portal.svelte"
  import { menuData } from "@zag-js/shared"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { onMount } from "svelte"
  import "@styles/menu.css"

  const id = $props.id()
  const service = useMachine(menu.machine, { id })
  const root = $derived(menu.connect(service, normalizeProps))

  const service2 = useMachine(menu.machine, { id: `${id}-sub` })
  const sub = $derived(menu.connect(service2, normalizeProps))

  const service3 = useMachine(menu.machine, { id: `${id}-sub2` })
  const sub2 = $derived(menu.connect(service3, normalizeProps))

  onMount(() => {
    root.setChild(service2)
    sub.setParent(service)
  })

  onMount(() => {
    sub.setChild(service3)
    sub2.setParent(service2)
  })

  const triggerItemProps = $derived(root.getTriggerItemProps(sub))
  const triggerItem2Props = $derived(sub.getTriggerItemProps(sub2))

  const [level1, level2, level3] = menuData
</script>

<main>
  <div>
    <button data-testid="trigger" {...root.getTriggerProps()}> Click me </button>

    <Portal>
      <div {...root.getPositionerProps()}>
        <ul data-testid="menu" {...root.getContentProps()}>
          {#each level1 as item (item.value)}
            {@const props = item.trigger ? triggerItemProps : root.getItemProps({ value: item.value })}
            <li data-testid={item.value} {...props}>
              {item.label}
            </li>
          {/each}
        </ul>
      </div>
    </Portal>

    <Portal>
      <div {...sub.getPositionerProps()}>
        <ul data-testid="more-tools-submenu" {...sub.getContentProps()}>
          {#each level2 as item (item.value)}
            {@const props = item.trigger ? triggerItem2Props : sub.getItemProps({ value: item.value })}
            <li data-testid={item.value} {...props}>
              {item.label}
            </li>
          {/each}
        </ul>
      </div>
    </Portal>

    <Portal>
      <div {...sub2.getPositionerProps()}>
        <ul data-testid="open-nested-submenu" {...sub2.getContentProps()}>
          {#each level3 as item (item.value)}
            <li data-testid={item.value} {...sub2.getItemProps({ value: item.value })}>
              {item.label}
            </li>
          {/each}
        </ul>
      </div>
    </Portal>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} label="Root Machine" />
  <StateVisualizer state={service2} label="Sub Machine" />
  <StateVisualizer state={service3} label="Sub2 Machine" />
</Toolbar>
