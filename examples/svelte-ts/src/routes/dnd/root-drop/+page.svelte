<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as dnd from "@zag-js/dnd"
  import styles from "@styles/dnd-list.module.css"
  import { GripVerticalIcon } from "lucide-svelte"
  import { ListCollection } from "@zag-js/collection"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"

  type Item = { id: string; name: string }

  function createList(items: Item[]) {
    return new ListCollection({
      items,
      itemToValue: (item) => item.id,
      itemToString: (item) => item.name,
    })
  }

  const sourceData: Item[] = [
    { id: "beedrill", name: "Beedrill" },
    { id: "pidgeot", name: "Pidgeot" },
    { id: "fearow", name: "Fearow" },
    { id: "jigglypuff", name: "Jigglypuff" },
  ]

  const ROOT = "inbox"

  const id = $props.id()
  let source = $state(createList(sourceData))
  let inbox = $state(createList([]))

  const service = useMachine(dnd.machine, (): dnd.Props => ({
    id,
    orientation: "vertical",
    dropPlacements: ["before", "after", "on"],
    getValueText: (value) => (value === ROOT ? "Inbox" : (source.stringify(value) ?? inbox.stringify(value) ?? value)),
    canDrag: (value) => source.has(value),
    canDrop: (dragSource, target, placement) => {
      if (!source.has(dragSource)) return false
      if (target === ROOT) return placement === "on"
      return inbox.has(target) && placement !== "on"
    },
    onDrop({ values, target, placement }) {
      const moved = source.findMany(values)
      if (moved.length === 0) return
      source = source.remove(...values)
      if (target === ROOT) inbox = inbox.append(...moved)
      else inbox = placement === "after" ? inbox.insertAfter(target, ...moved) : inbox.insertBefore(target, ...moved)
    },
  }))
  const api = $derived(dnd.connect(service, normalizeProps))
</script>

<main class={`${styles.main} ${styles.wide}`}>
  <div {...api.getRootProps()} class={styles.root}>
    <h3>Drop on the collection</h3>
    <p class={styles.helperText}>
      Root drop: hover the empty inbox to drop on the list as a whole, or insert between items once it has rows.
    </p>
    <div class={styles.transferLayout}>
      <div class={styles.transferColumn}>
        <h4>Available</h4>
        <ul class={styles.transferList}>
          {#each source.items as item (item.id)}
            <li class={styles.item}>
              <div {...mergeProps(api.getDraggableProps({ value: item.id }), { class: styles.draggable })}>
                <span {...api.getDragHandleProps({ value: item.id })} class={styles.dragHandle}>
                  <GripVerticalIcon size={14} />
                </span>
                {item.name}
              </div>
            </li>
          {/each}
        </ul>
      </div>
      <div class={styles.transferColumn}>
        <h4>Inbox</h4>
        <div {...mergeProps(api.getDropTargetProps({ value: ROOT }), { class: styles.rootDrop })}>
          {#if inbox.size === 0}
            <p class={styles.rootDropEmpty}>Drop onto the list</p>
          {:else}
            <ul class={styles.transferList}>
              {#each inbox.items as item (item.id)}
                <li class={styles.item}>
                  <div
                    {...api.getDropIndicatorProps({ value: item.id, placement: "before" })}
                    class={styles.dropIndicator}
                  ></div>
                  <div
                    {...mergeProps(api.getDropTargetProps({ value: item.id }), {
                      class: `${styles.draggable} ${styles.dropTarget}`,
                    })}
                  >
                    {item.name}
                  </div>
                  <div
                    {...api.getDropIndicatorProps({ value: item.id, placement: "after" })}
                    class={styles.dropIndicator}
                  ></div>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      </div>
    </div>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
