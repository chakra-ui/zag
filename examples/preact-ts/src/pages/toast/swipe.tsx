import { normalizeProps, Portal, useMachine } from "@zag-js/preact"
import * as toast from "@zag-js/toast"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { ToastItem } from "../../components/toast-item"
import { Toolbar } from "../../components/toolbar"
import "@styles/toast.css"

const toaster = toast.createStore({ placement: "bottom-end", duration: Infinity })

const variants: Array<{ label: string; swipeDirections?: toast.SwipeDirection[] }> = [
  { label: "Default" },
  { label: "Right", swipeDirections: ["right"] },
  { label: "Up and right", swipeDirections: ["up", "right"] },
  { label: "Left and right", swipeDirections: ["left", "right"] },
  { label: "Up and down", swipeDirections: ["up", "down"] },
  { label: "No swipe", swipeDirections: [] },
]

export default function Page() {
  const service = useMachine(toast.group.machine, { id: useId(), store: toaster })
  const api = toast.group.connect(service, normalizeProps)

  return (
    <>
      <main>
        <div className="hstack">
          {variants.map(({ label, swipeDirections }) => (
            <button
              key={label}
              onClick={() =>
                toaster.create({ title: `Swipe: ${label}`, description: "Drag to dismiss", swipeDirections })
              }
            >
              {label}
            </button>
          ))}
        </div>
        <Portal>
          <div {...api.getGroupProps()}>
            {api.getToasts().map((actor, index) => (
              <ToastItem key={actor.id} actor={actor} index={index} parent={service} />
            ))}
          </div>
        </Portal>
      </main>
      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
