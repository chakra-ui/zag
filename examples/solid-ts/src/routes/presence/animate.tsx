import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, Show, type JSX } from "solid-js"
import "@styles/presence.css"

interface PresenceChildProps {
  ref: (node: HTMLElement) => void
  hidden: boolean
  "data-state": "open" | "closed" | undefined
}

interface AnimatePresenceProps {
  present: boolean
  onExitComplete?: () => void
  children: (props: PresenceChildProps) => JSX.Element
}

function AnimatePresence(props: AnimatePresenceProps) {
  const service = useMachine(presence.machine, () => ({
    present: props.present,
    onExitComplete: props.onExitComplete,
  }))
  const api = createMemo(() => presence.connect(service, normalizeProps))

  // Keep rendering the child while the exit animation runs
  return (
    <Show when={api().present}>
      {props.children({
        ref: (node) => api().setNode(node),
        get hidden() {
          return !api().present
        },
        get "data-state"() {
          return api().skip ? undefined : props.present ? "open" : "closed"
        },
      })}
    </Show>
  )
}

export default function Page() {
  const [open, setOpen] = createSignal(true)
  const [unmounted, setUnmounted] = createSignal(false)

  return (
    <main style={{ "min-width": "400px", padding: "40px", display: "flex", "flex-direction": "column", gap: "1rem" }}>
      <div>
        Open: {String(open())}, Unmounted: {String(unmounted())}
      </div>
      <button
        onClick={() => {
          setUnmounted(false)
          setOpen((v) => !v)
        }}
      >
        Toggle
      </button>
      <AnimatePresence present={open()} onExitComplete={() => setUnmounted(true)}>
        {(childProps) => (
          <div data-presence-root {...childProps}>
            <div>Content</div>
          </div>
        )}
      </AnimatePresence>
    </main>
  )
}
