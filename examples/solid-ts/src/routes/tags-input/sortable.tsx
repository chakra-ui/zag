import * as dnd from "@zag-js/dnd"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import * as tagsInput from "@zag-js/tags-input"
import { XIcon } from "lucide-solid"
import { createMemo, createSignal, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/tags-input.css"

const hint = "Drag to reorder, or highlight a tag with the arrow keys and press Alt + Left or Right."

export default function Page() {
  const id = createUniqueId()
  const [value, setValue] = createSignal(["Design", "Build", "Test", "Ship"])

  const tagsService = useMachine(tagsInput.machine, () => ({
    id,
    value: value(),
    placeholder: "Add step",
    // Keyed by value so the highlight follows a tag when it moves
    ids: { item: ({ value }) => `${id}:tag:${value}` },
    onValueChange: (details) => setValue(details.value),
  }))
  const tagsApi = createMemo(() => tagsInput.connect(tagsService, normalizeProps))

  const dndService = useMachine(dnd.machine, {
    id: createUniqueId(),
    orientation: "horizontal",
    activationConstraint: { distance: 4 },
    translations: { instructions: hint },
    onDrop(details) {
      setValue((prev) => dnd.reorder(prev, { ...details, itemToValue: (item) => item }))
    },
  })
  const dndApi = createMemo(() => dnd.connect(dndService, normalizeProps))

  function onInputKeyDown(event: KeyboardEvent) {
    const source = tagsApi().highlightedValue
    if (!event.altKey || !source) return
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
    event.preventDefault()
    dndApi().move({ value: source, to: event.key === "ArrowLeft" ? "prev" : "next" })
  }

  return (
    <>
      <main class="tags-input">
        <div {...tagsApi().getRootProps()}>
          <label {...tagsApi().getLabelProps()}>Steps</label>
          <div {...dndApi().getRootProps()}>
            <div {...tagsApi().getControlProps()}>
              <For each={tagsApi().value}>
                {(value, index) => (
                  <span
                    {...mergeProps(
                      tagsApi().getItemProps({ index: index(), value }),
                      dndApi().getDraggableProps({ value }),
                      dndApi().getDropTargetProps({ value }),
                      { tabIndex: -1 },
                    )}
                  >
                    <div {...dndApi().getDropIndicatorProps({ value, placement: "before" })} />
                    <div {...tagsApi().getItemPreviewProps({ index: index(), value })}>
                      <span {...tagsApi().getItemTextProps({ index: index(), value })}>{value}</span>
                      <button {...tagsApi().getItemDeleteTriggerProps({ index: index(), value })}>
                        <XIcon />
                      </button>
                    </div>
                    <input {...tagsApi().getItemInputProps({ index: index(), value })} />
                    <div {...dndApi().getDropIndicatorProps({ value, placement: "after" })} />
                  </span>
                )}
              </For>
              <input
                {...mergeProps(tagsApi().getInputProps(), {
                  "aria-describedby": `${id}:hint`,
                  onKeyDown: onInputKeyDown,
                })}
              />
            </div>
          </div>
          <input {...tagsApi().getHiddenInputProps()} />
          <p id={`${id}:hint`} class="tags-input-hint">
            {hint}
          </p>
        </div>
      </main>
      <Toolbar>
        <StateVisualizer state={tagsService} />
      </Toolbar>
    </>
  )
}
