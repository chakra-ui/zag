<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as dnd from "@zag-js/dnd"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tagsInput from "@zag-js/tags-input"
  import { XIcon } from "lucide-svelte"
  import "@styles/tags-input.css"

  const hint = "Drag to reorder, or highlight a tag with the arrow keys and press Alt + Left or Right."

  const id = $props.id()
  let value = $state(["Design", "Build", "Test", "Ship"])
  let announcement = $state("")

  const tagsService = useMachine(tagsInput.machine, (): tagsInput.Props => ({
    id,
    value,
    placeholder: "Add step",
    // Keyed by value so the highlight follows a tag when it moves
    ids: { item: ({ value }) => `${id}:tag:${value}` },
    onValueChange: (details) => (value = details.value),
  }))
  const tagsApi = $derived(tagsInput.connect(tagsService, normalizeProps))

  const dndService = useMachine(dnd.machine, (): dnd.Props => ({
    id: `${id}-dnd`,
    orientation: "horizontal",
    activationConstraint: { distance: 4 },
    translations: { instructions: hint },
    onDrop(details) {
      value = dnd.reorder(value, { ...details, itemToValue: (item) => item })
    },
  }))
  const dndApi = $derived(dnd.connect(dndService, normalizeProps))

  function onInputKeyDown(event: KeyboardEvent) {
    const highlighted = tagsApi.highlightedValue
    if (!event.altKey || !highlighted) return
    const step = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0
    const target = value[value.indexOf(highlighted) + step]
    if (!step || !target) return

    event.preventDefault()
    const next = dnd.reorder(value, {
      source: highlighted,
      target,
      placement: step < 0 ? "before" : "after",
      itemToValue: (item) => item,
    })
    value = next
    announcement = `${highlighted} moved to position ${next.indexOf(highlighted) + 1} of ${next.length}`
  }
</script>

<main class="tags-input">
  <div {...tagsApi.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...tagsApi.getLabelProps()}>Steps</label>
    <div {...dndApi.getRootProps()}>
      <div {...tagsApi.getControlProps()}>
        {#each tagsApi.value as value, index (value)}
          <span
            {...mergeProps(
              tagsApi.getItemProps({ index, value }),
              dndApi.getDraggableProps({ value }),
              dndApi.getDropTargetProps({ value }),
              { tabindex: -1 },
            )}
          >
            <div {...dndApi.getDropIndicatorProps({ value, placement: "before" })}></div>
            <div {...tagsApi.getItemPreviewProps({ index, value })}>
              <span {...tagsApi.getItemTextProps({ index, value })}>{value}</span>
              <button {...tagsApi.getItemDeleteTriggerProps({ index, value })}>
                <XIcon />
              </button>
            </div>
            <input {...tagsApi.getItemInputProps({ index, value })} />
            <div {...dndApi.getDropIndicatorProps({ value, placement: "after" })}></div>
          </span>
        {/each}
        <input
          {...mergeProps(tagsApi.getInputProps(), {
            "aria-describedby": `${id}:hint`,
            onkeydown: onInputKeyDown,
          })}
        />
      </div>
    </div>
    <input {...tagsApi.getHiddenInputProps()} />
    <p id={`${id}:hint`} class="tags-input-hint">{hint}</p>
    <span class="sr-only" aria-live="polite">{announcement}</span>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={tagsService} />
</Toolbar>
