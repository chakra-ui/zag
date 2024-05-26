<script lang="ts">
  import * as menu from "@zag-js/menu"
  import { normalizeProps, portal, useMachine } from "@zag-js/svelte"
  import { menuData } from "@zag-js/shared"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { onMount } from "svelte"

  const [snapshot, send, machine] = useMachine(menu.machine({ id: "1" }))
  const root = $derived(menu.connect(snapshot, send, normalizeProps))

  const [subSnapshot, subSend, subMachine] = useMachine(menu.machine({ id: "2" }))
  const sub = $derived(menu.connect(subSnapshot, subSend, normalizeProps))

  const [sub2Snapshot, sub2Send, sub2Machine] = useMachine(menu.machine({ id: "3" }))
  const sub2 = $derived(menu.connect(sub2Snapshot, sub2Send, normalizeProps))

  onMount(() => {
    root.setChild(subMachine)
    sub.setParent(machine)
  })

  onMount(() => {
    sub.setChild(sub2Machine)
    sub2.setParent(subMachine)
  })

  const triggerItemProps = $derived(root.getTriggerItemProps(sub))
  const triggerItem2Props = $derived(sub.getTriggerItemProps(sub2))

  const [level1, level2, level3] = menuData
</script>

<main>
  <div>
    <button data-testid="trigger" {...root.triggerProps}> Click me </button>

    <div use:portal {...root.positionerProps}>
      <ul data-testid="menu" {...root.contentProps}>
        {#each level1 as item, i (i)}
          {@const props = item.trigger ? triggerItemProps : root.getItemProps({ value: item.value })}
          <li data-testid={item.value} {...props}>
            {item.label}
          </li>
        {/each}
      </ul>
    </div>

    <div use:portal {...sub.positionerProps}>
      <ul data-testid="more-tools-submenu" {...sub.contentProps}>
        {#each level2 as item, i (i)}
          {@const props = item.trigger ? triggerItem2Props : sub.getItemProps({ value: item.value })}
          <li data-testid={item.value} {...props}>
            {item.label}
          </li>
        {/each}
      </ul>
    </div>

    <div use:portal {...sub2.positionerProps}>
      <ul data-testid="open-nested-submenu" {...sub2.contentProps}>
        {#each level3 as item, i (i)}
          <li data-testid={item.value} {...sub2.getItemProps({ value: item.value })}>
            {item.label}
          </li>
        {/each}
      </ul>
    </div>
  </div>
</main>

<Toolbar controls={null}>
  <StateVisualizer state={snapshot} label="Root Machine" />
  <StateVisualizer state={subSnapshot} label="Sub Machine" />
  <StateVisualizer state={sub2Snapshot} label="Sub2 Machine" />
</Toolbar>
