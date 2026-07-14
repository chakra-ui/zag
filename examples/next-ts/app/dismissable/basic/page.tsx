"use client"

import {
  getDismissableLayerAttrs,
  getDismissableLayerStyle,
  trackDismissableElement,
  type LayerSnapshot,
} from "@zag-js/dismissable"
import { getPlacement } from "@zag-js/popper"
import { Portal } from "@zag-js/react"
import { useEffect, useRef, useState } from "react"

interface PopoverProps {
  children?: React.ReactNode
  bg: string
  id: string
  inert?: boolean
}

function Popover(props: PopoverProps) {
  const { children, bg, id, inert } = props

  const [open, setOpen] = useState(false)
  const [layer, setLayer] = useState<LayerSnapshot | null>(null)

  const ref = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const cleanup = [
      getPlacement(buttonRef.current, ref.current, {
        placement: "right",
      }),
      trackDismissableElement(ref.current, {
        pointerBlocking: inert,
        onLayerChange: setLayer,
        onDismiss: () => setOpen(false),
        exclude: [buttonRef.current],
      }),
    ]
    return () => {
      cleanup.forEach((c) => c())
    }
  }, [open, inert])

  return (
    <div style={{ padding: 40 }}>
      <button ref={buttonRef} data-testid={`trigger-${id}`} onClick={() => setOpen((v) => !v)}>
        Dismiss
      </button>
      <Portal>
        <div
          hidden={!open}
          ref={ref}
          data-testid={`layer-${id}`}
          {...getDismissableLayerAttrs(layer)}
          style={
            {
              position: "fixed",
              top: 0,
              left: 0,
              transform: "translate3d(var(--x, 0px), var(--y, -100vh), 0)",
              // getPlacement() also writes to --z-index (copying the content's own
              // computed z-index), so use --layer-index directly to avoid the clash.
              zIndex: "var(--layer-index)",
              background: bg,
              padding: 10,
              ...getDismissableLayerStyle(layer, { pointerEvents: true }),
            } as React.CSSProperties
          }
        >
          <h1>Sandbox</h1>
          <p>This is a sandbox page.</p>
          {children}
        </div>
      </Portal>
    </div>
  )
}

export default function Page() {
  return (
    <div>
      <iframe title="sdfdsfs" src="https://motion.dev/" />
      <Popover id="1" bg="pink" inert>
        <p>This is a popover.</p>
        <input placeholder="Initial...." />
        <Popover id="2" bg="green">
          <p>This is a nested popover.</p>
          <input placeholder="Nested 1...." />
          <Popover id="3" bg="teal" inert>
            <p>This is a nested popover.</p>
            <input placeholder="Nested 2...." />
          </Popover>
        </Popover>
      </Popover>
    </div>
  )
}
