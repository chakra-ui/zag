<script lang="ts">
  import { ListCollection } from "@zag-js/collection"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import * as dnd from "@zag-js/dnd"
  import { GripVertical } from "lucide-svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import styles from "@styles/dnd-list.module.css"

  const COPY = "library"
  const MOVE = "archive"
  const id = $props.id()

  type Item = { id: string; name: string }

  function createList(items: Item[]) {
    return new ListCollection({
      items,
      itemToValue: (item) => item.id,
      itemToString: (item) => item.name,
    })
  }

  let source = $state(
    createList([
      { id: "photoshop", name: "Adobe Photoshop" },
      { id: "xd", name: "Adobe XD" },
      { id: "dreamweaver", name: "Adobe Dreamweaver" },
      { id: "indesign", name: "Adobe InDesign" },
    ]),
  )
  let library = $state(createList([]))
  let archive = $state(createList([]))

  const service = useMachine(dnd.machine, {
    id,
    orientation: "vertical",
    dropPlacements: ["on"],
    getValueText: (value) => {
      if (value === COPY) return "Library"
      if (value === MOVE) return "Archive"
      return source.stringify(value) ?? value
    },
    canDrag: (value) => source.has(value),
    canDrop: (dragSource, target) => source.has(dragSource) && (target === COPY || target === MOVE),
    onDrop({ values, target }) {
      const moved = source.findMany(values)
      if (!moved.length) return
      if (target === COPY) {
        library = library.append(...moved.map((item) => ({ id: `${item.id}-${crypto.randomUUID()}`, name: item.name })))
        return
      }
      source = source.remove(...values)
      archive = archive.append(...moved)
    },
  })

  const api = $derived(dnd.connect(service, normalizeProps))
</script>

<main class="{styles.main} {styles.wide}">
  <div {...api.getRootProps()} class={styles.root}>
    <h3>Copy vs move</h3>
    <p class={styles.helperText}>
      Library copies. Archive moves. Zag reports the target; the app chooses the operation.
    </p>
    <div class={styles.transferLayout}>
      <div class={styles.transferColumn}>
        <h4>Source</h4>
        <ul class={styles.transferList}>
          {#each source.items as item (item.id)}
            <li class={styles.item}>
              <div {...mergeProps(api.getDraggableProps({ value: item.id }), { class: styles.draggable })}>
                <span {...api.getDragHandleProps({ value: item.id })} class={styles.dragHandle}>
                  <GripVertical size={14} />
                </span>
                {item.name}
              </div>
            </li>
          {/each}
        </ul>
      </div>
      <div class={styles.transferColumn}>
        <h4>Library (copy)</h4>
        <div {...mergeProps(api.getDropTargetProps({ value: COPY }), { class: styles.rootDrop })}>
          {#if library.size === 0}
            <p class={styles.rootDropEmpty}>Drop here</p>
          {:else}
            <ul class={styles.transferList}>
              {#each library.items as item (item.id)}
                <li class={styles.item}><div class={styles.draggable}>{item.name}</div></li>
              {/each}
            </ul>
          {/if}
        </div>
      </div>
      <div class={styles.transferColumn}>
        <h4>Archive (move)</h4>
        <div {...mergeProps(api.getDropTargetProps({ value: MOVE }), { class: styles.rootDrop })}>
          {#if archive.size === 0}
            <p class={styles.rootDropEmpty}>Drop here</p>
          {:else}
            <ul class={styles.transferList}>
              {#each archive.items as item (item.id)}
                <li class={styles.item}><div class={styles.draggable}>{item.name}</div></li>
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
