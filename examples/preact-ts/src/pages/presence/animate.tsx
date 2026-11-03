import { normalizeProps, useMachine } from "@zag-js/preact"
import * as presence from "@zag-js/presence"
import { cloneElement, isValidElement, toChildArray, type ComponentChildren, type VNode } from "preact"
import { useLayoutEffect, useRef, useState } from "preact/hooks"
import "@styles/presence.css"

interface AnimatePresenceProps {
  onExitComplete?: () => void
  children: ComponentChildren
}

function getChild(children: ComponentChildren) {
  const [child] = toChildArray(children)
  return isValidElement(child) ? child : undefined
}

function AnimatePresence(props: AnimatePresenceProps) {
  const { children, onExitComplete } = props

  const present = !!children

  const service = useMachine(presence.machine, { present, onExitComplete })
  const api = presence.connect(service, normalizeProps)

  const lastPresentChild = useRef<ComponentChildren>(null)
  const child = getChild(children)

  useLayoutEffect(() => {
    if (child) lastPresentChild.current = child
  }, [child])

  if (!api.present) return null

  const renderChild = child || lastPresentChild.current
  if (!isValidElement(renderChild)) return null

  return cloneElement(
    renderChild as VNode,
    {
      hidden: !api.present,
      "data-state": api.skip ? undefined : present ? "open" : "closed",
      ref: api.setNode,
    } as Record<string, unknown>,
  )
}

export default function Page() {
  const [open, setOpen] = useState(true)
  const [unmounted, setUnmounted] = useState(false)

  return (
    <main style={{ minWidth: 400, padding: 40, display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        Open: {String(open)}, Unmounted: {String(unmounted)}
      </div>
      <button
        onClick={() => {
          setUnmounted(false)
          setOpen((v) => !v)
        }}
      >
        Toggle
      </button>
      <AnimatePresence onExitComplete={() => setUnmounted(true)}>
        {open ? (
          <div data-presence-root>
            <div>Content</div>
          </div>
        ) : null}
      </AnimatePresence>
    </main>
  )
}
