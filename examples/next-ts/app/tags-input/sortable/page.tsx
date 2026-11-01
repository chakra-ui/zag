"use client"

import * as dnd from "@zag-js/dnd"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import * as tagsInput from "@zag-js/tags-input"
import { XIcon } from "lucide-react"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/tags-input.css"

const hint = "Drag to reorder, or highlight a tag with the arrow keys and press Alt + Left or Right."

export default function Page() {
  const id = useId()
  const [value, setValue] = useState(["Design", "Build", "Test", "Ship"])
  const [announcement, setAnnouncement] = useState("")

  const tagsService = useMachine(tagsInput.machine, {
    id,
    value,
    placeholder: "Add step",
    // Keyed by value so the highlight follows a tag when it moves
    ids: { item: ({ value }) => `${id}:tag:${value}` },
    onValueChange: (details) => setValue(details.value),
  })
  const tagsApi = tagsInput.connect(tagsService, normalizeProps)

  const dndService = useMachine(dnd.machine, {
    id: useId(),
    orientation: "horizontal",
    activationConstraint: { distance: 4 },
    translations: { instructions: hint },
    onDrop(details) {
      setValue((prev) => dnd.reorder(prev, { ...details, itemToValue: (item) => item }))
    },
  })
  const dndApi = dnd.connect(dndService, normalizeProps)

  function onInputKeyDown(event: React.KeyboardEvent) {
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
    setValue(next)
    setAnnouncement(`${highlighted} moved to position ${next.indexOf(highlighted) + 1} of ${next.length}`)
  }

  return (
    <>
      <main className="tags-input">
        <div {...tagsApi.getRootProps()}>
          <label {...tagsApi.getLabelProps()}>Steps</label>
          <div {...dndApi.getRootProps()}>
            <div {...tagsApi.getControlProps()}>
              {tagsApi.value.map((value, index) => (
                <span
                  key={value}
                  {...mergeProps(
                    tagsApi.getItemProps({ index, value }),
                    dndApi.getDraggableProps({ value }),
                    dndApi.getDropTargetProps({ value }),
                    { tabIndex: -1 },
                  )}
                >
                  <div {...dndApi.getDropIndicatorProps({ value, placement: "before" })} />
                  <div {...tagsApi.getItemPreviewProps({ index, value })}>
                    <span {...tagsApi.getItemTextProps({ index, value })}>{value}</span>
                    <button {...tagsApi.getItemDeleteTriggerProps({ index, value })}>
                      <XIcon />
                    </button>
                  </div>
                  <input {...tagsApi.getItemInputProps({ index, value })} />
                  <div {...dndApi.getDropIndicatorProps({ value, placement: "after" })} />
                </span>
              ))}
              <input
                {...mergeProps(tagsApi.getInputProps(), {
                  "aria-describedby": `${id}:hint`,
                  onKeyDown: onInputKeyDown,
                })}
              />
            </div>
          </div>
          <input {...tagsApi.getHiddenInputProps()} />
          <p id={`${id}:hint`} className="tags-input-hint">
            {hint}
          </p>
          <span className="sr-only" aria-live="polite">
            {announcement}
          </span>
        </div>
      </main>
      <Toolbar>
        <StateVisualizer state={tagsService} />
      </Toolbar>
    </>
  )
}
