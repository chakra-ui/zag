"use client"

import * as dnd from "@zag-js/dnd"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import { tabsData } from "@zag-js/shared"
import * as tabs from "@zag-js/tabs"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/tabs.css"
import "@styles/tabs-reorder.css"

const hint = "Drag a tab to reorder, or press Alt + Left or Right."

export default function Page() {
  const [items, setItems] = useState(tabsData)

  const tabsService = useMachine(tabs.machine, {
    id: useId(),
    defaultValue: "nils",
  })

  const dndService = useMachine(dnd.machine, {
    id: useId(),
    orientation: "horizontal",
    activationConstraint: { distance: 4 },
    // Enter and Space select tabs, so reorder with Alt + arrow instead
    isActivationKey: () => false,
    translations: { instructions: hint, roleDescription: null },
    onDrop(details) {
      setItems((prev) => dnd.reorder(prev, { ...details, itemToValue: (item) => item.id }))
    },
  })

  const tabsApi = tabs.connect(tabsService, normalizeProps)
  const dndApi = dnd.connect(dndService, normalizeProps)

  function onTriggerKeyDown(event: React.KeyboardEvent, value: string) {
    if (!event.altKey || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return
    event.preventDefault()
    dndApi.move({ value, to: event.key === "ArrowLeft" ? "prev" : "next" })
  }

  return (
    <>
      <main className="tabs">
        <div {...tabsApi.getRootProps()}>
          <div {...tabsApi.getIndicatorProps()} />
          <div {...mergeProps(dndApi.getRootProps(), tabsApi.getListProps())}>
            {items.map((item) => (
              <button
                key={item.id}
                {...mergeProps(
                  dndApi.getDraggableProps({ value: item.id }),
                  dndApi.getDropTargetProps({ value: item.id }),
                  tabsApi.getTriggerProps({ value: item.id }),
                  {
                    onKeyDown: (event: React.KeyboardEvent) => onTriggerKeyDown(event, item.id),
                  },
                )}
              >
                <span {...dndApi.getDropIndicatorProps({ value: item.id, placement: "before" })} />
                {item.label}
                <span {...dndApi.getDropIndicatorProps({ value: item.id, placement: "after" })} />
              </button>
            ))}
          </div>
          {items.map((item) => (
            <div key={item.id} {...tabsApi.getContentProps({ value: item.id })}>
              <p>{item.content}</p>
            </div>
          ))}
        </div>
        <p className="tabs-reorder-hint">{hint}</p>
      </main>

      <Toolbar>
        <StateVisualizer state={tabsService} label="tabs" />
        <StateVisualizer state={dndService} label="dnd" />
      </Toolbar>
    </>
  )
}
