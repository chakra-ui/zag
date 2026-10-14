<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as menu from "@zag-js/menu"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { onMount } from "svelte"
  import "@styles/menu.css"

  // Hovering between submenu triggers whose content holds an input must not close the parent menu

  const id = $props.id()

  const rootService = useMachine(menu.machine, { id })
  const root = $derived(menu.connect(rootService, normalizeProps))

  const sub1Service = useMachine(menu.machine, { id: `${id}-sub1` })
  const sub1 = $derived(menu.connect(sub1Service, normalizeProps))

  const sub2Service = useMachine(menu.machine, { id: `${id}-sub2` })
  const sub2 = $derived(menu.connect(sub2Service, normalizeProps))

  const sub3Service = useMachine(menu.machine, { id: `${id}-sub3` })
  const sub3 = $derived(menu.connect(sub3Service, normalizeProps))

  onMount(() => {
    root.setChild(sub1Service)
    sub1.setParent(rootService)
    root.setChild(sub2Service)
    sub2.setParent(rootService)
    root.setChild(sub3Service)
    sub3.setParent(rootService)
  })

  const sub1TriggerProps = $derived(root.getTriggerItemProps(sub1))
  const sub2TriggerProps = $derived(root.getTriggerItemProps(sub2))
  const sub3TriggerProps = $derived(root.getTriggerItemProps(sub3))
</script>

<main>
  <div>
    <button data-testid="trigger" {...root.getTriggerProps()}>Open Menu</button>

    <Portal>
      <div {...root.getPositionerProps()}>
        <ul data-testid="menu" {...root.getContentProps()}>
          <li {...root.getItemProps({ value: "item1" })}>Regular Item 1</li>
          <li data-testid="sub1-trigger" {...sub1TriggerProps}>Submenu with Input 1 →</li>
          <li data-testid="sub2-trigger" {...sub2TriggerProps}>Submenu with Input 2 →</li>
          <li data-testid="sub3-trigger" {...sub3TriggerProps}>Submenu with Input 3 →</li>
          <li {...root.getItemProps({ value: "item2" })}>Regular Item 2</li>
        </ul>
      </div>
    </Portal>

    <Portal>
      <div {...sub1.getPositionerProps()}>
        <div data-testid="sub1-content" {...sub1.getContentProps()}>
          <input placeholder="Type here..." style="padding: 8px; margin: 8px" />
        </div>
      </div>
    </Portal>

    <Portal>
      <div {...sub2.getPositionerProps()}>
        <div data-testid="sub2-content" {...sub2.getContentProps()}>
          <input placeholder="Type here..." style="padding: 8px; margin: 8px" />
        </div>
      </div>
    </Portal>

    <Portal>
      <div {...sub3.getPositionerProps()}>
        <div data-testid="sub3-content" {...sub3.getContentProps()}>
          <input placeholder="Type here..." style="padding: 8px; margin: 8px" />
        </div>
      </div>
    </Portal>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={rootService} label="Root" />
  <StateVisualizer state={sub1Service} label="Sub1" />
  <StateVisualizer state={sub2Service} label="Sub2" />
  <StateVisualizer state={sub3Service} label="Sub3" />
</Toolbar>
