"use client"

import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as React from "react"
import "@styles/presence.css"

interface AnimatePresenceProps {
  onExitComplete?: () => void
  children: React.ReactNode
}

function getChild(children: React.ReactNode) {
  const child = Array.isArray(children) ? React.Children.only(children) : children
  return React.isValidElement(child) ? child : undefined
}

function AnimatePresence(props: AnimatePresenceProps) {
  const { children, onExitComplete } = props

  const present = !!children

  const service = useMachine(presence.machine, { present, onExitComplete })
  const api = presence.connect(service, normalizeProps)

  const lastPresentChild = React.useRef<React.ReactNode>(null)
  const child = getChild(children)

  React.useLayoutEffect(() => {
    if (child) lastPresentChild.current = child
  }, [child])

  if (!api.present) return null

  const renderChild = child || lastPresentChild.current
  if (!React.isValidElement(renderChild)) return null

  return React.cloneElement(renderChild, {
    hidden: !api.present,
    "data-state": api.skip ? undefined : present ? "open" : "closed",
    ref: api.setNode,
  } as React.Attributes & { ref: (node: HTMLElement | null) => void })
}

export default function Page() {
  const [open, setOpen] = React.useState(true)
  const [unmounted, setUnmounted] = React.useState(false)

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
