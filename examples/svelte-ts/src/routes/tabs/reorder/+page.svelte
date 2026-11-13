<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as dnd from "@zag-js/dnd"
  import { tabsData } from "@zag-js/shared"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tabs from "@zag-js/tabs"
  import "@styles/tabs.css"
  import "@styles/tabs-reorder.css"

  const hint = "Drag a tab to reorder, or press Alt + Left or Right."

  const id = $props.id()
  let items = $state(tabsData)

  const tabsService = useMachine(tabs.machine, {
    id,
    defaultValue: "nils",
  })
  const tabsApi = $derived(tabs.connect(tabsService, normalizeProps))

  const dndService = useMachine(dnd.machine, (): dnd.Props => ({
    id: `${id}-dnd`,
    orientation: "horizontal",
    activationConstraint: { distance: 4 },
    // Enter and Space select tabs, so reorder with Alt + arrow instead
    isActivationKey: () => false,
    translations: { instructions: hint, roleDescription: null },
    onDrop(details) {
      items = dnd.reorder(items, { ...details, itemToValue: (item) => item.id })
    },
  }))
  const dndApi = $derived(dnd.connect(dndService, normalizeProps))

  function onTriggerKeyDown(event: KeyboardEvent, value: string) {
    if (!event.altKey || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return
    event.preventDefault()
    dndApi.move({ value, to: event.key === "ArrowLeft" ? "prev" : "next" })
  }
</script>

<main class="tabs">
  <div {...tabsApi.getRootProps()}>
    <div {...tabsApi.getIndicatorProps()}></div>
    <div {...mergeProps(dndApi.getRootProps(), tabsApi.getListProps())}>
      {#each items as item (item.id)}
        <button
          {...mergeProps(
            dndApi.getDraggableProps({ value: item.id }),
            dndApi.getDropTargetProps({ value: item.id }),
            tabsApi.getTriggerProps({ value: item.id }),
            {
              onkeydown: (event: KeyboardEvent) => onTriggerKeyDown(event, item.id),
            },
          )}
        >
          <span {...dndApi.getDropIndicatorProps({ value: item.id, placement: "before" })}></span>
          {item.label}
          <span {...dndApi.getDropIndicatorProps({ value: item.id, placement: "after" })}></span>
        </button>
      {/each}
    </div>
    {#each items as item (item.id)}
      <div {...tabsApi.getContentProps({ value: item.id })}>
        <p>{item.content}</p>
      </div>
    {/each}
  </div>
  <p class="tabs-reorder-hint">{hint}</p>
</main>

<Toolbar>
  <StateVisualizer state={tabsService} label="tabs" />
  <StateVisualizer state={dndService} label="dnd" />
</Toolbar>
