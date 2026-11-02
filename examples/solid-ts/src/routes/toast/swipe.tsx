import { Key, normalizeProps, useMachine } from "@zag-js/solid"
import * as toast from "@zag-js/toast"
import { createMemo, createUniqueId, For } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { ToastItem } from "~/components/toast-item"
import { Toolbar } from "~/components/toolbar"
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
  const service = useMachine(toast.group.machine, { id: createUniqueId(), store: toaster })
  const api = createMemo(() => toast.group.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div class="hstack">
          <For each={variants}>
            {({ label, swipeDirections }) => (
              <button
                onClick={() =>
                  toaster.create({ title: `Swipe: ${label}`, description: "Drag to dismiss", swipeDirections })
                }
              >
                {label}
              </button>
            )}
          </For>
        </div>
        <Portal>
          <div {...api().getGroupProps()}>
            <Key each={api().getToasts()} by={(actor) => actor.id}>
              {(actor, index) => <ToastItem actor={actor} index={index} parent={service} />}
            </Key>
          </div>
        </Portal>
      </main>
      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
