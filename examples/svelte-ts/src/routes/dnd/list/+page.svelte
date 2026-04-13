<script lang="ts">
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import * as dnd from "@zag-js/dnd"
  import { GripVertical } from "lucide-svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"

  const initialItems = [
    { id: "1", label: "Apple" },
    { id: "2", label: "Banana" },
    { id: "3", label: "Cherry" },
    { id: "4", label: "Date" },
    { id: "5", label: "Elderberry" },
  ]

  const id = $props.id()
  let items = $state(initialItems)

  const service = useMachine(dnd.machine, {
    id,
    orientation: "vertical",
    onDrop(details) {
      const { source, target, placement } = details
      if (placement === "on") return
      const fromIndex = items.findIndex((item) => item.id === source)
      const toIndex = items.findIndex((item) => item.id === target)
      if (fromIndex === -1 || toIndex === -1) return
      items = dnd.move(items, fromIndex, dnd.getDestinationIndex(items.length, fromIndex, toIndex, placement))
    },
  })

  const api = $derived(dnd.connect(service, normalizeProps))
</script>

<main class="dnd">
  <div {...api.getRootProps()}>
    <h3>Sortable List</h3>
    <ul style:list-style="none" style:padding="0">
      {#each items as item (item.id)}
        <li style:position="relative">
          <div {...api.getDropIndicatorProps({ value: item.id, placement: "before" })} />
          <div
            {...mergeProps(
              api.getDraggableProps({ value: item.id }),
              api.getDropTargetProps({ value: item.id }),
            )}
          >
            <span {...api.getDragHandleProps({ value: item.id })}>
              <GripVertical size={14} />
            </span>
            {item.label}
          </div>
          <div {...api.getDropIndicatorProps({ value: item.id, placement: "after" })} />
        </li>
      {/each}
    </ul>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
