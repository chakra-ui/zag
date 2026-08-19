import {
  getDismissableLayerAttrs,
  getDismissableLayerStyle,
  trackDismissableElement,
  type LayerSnapshot,
} from "@zag-js/dismissable"
import { getPlacement } from "@zag-js/popper"
import { Portal } from "@zag-js/preact"
import { type ComponentChildren } from "preact"
import { useEffect, useRef, useState } from "preact/hooks"

interface PopoverProps {
  background: string
  children?: ComponentChildren
  id: string
  pointerBlocking?: boolean
}

function Popover(props: PopoverProps) {
  const [open, setOpen] = useState(false)
  const [layer, setLayer] = useState<LayerSnapshot | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const cleanups = [
      getPlacement(triggerRef.current, contentRef.current, { placement: "right" }),
      trackDismissableElement(contentRef.current, {
        pointerBlocking: props.pointerBlocking,
        onLayerChange: setLayer,
        onDismiss: () => setOpen(false),
        exclude: [triggerRef.current],
      }),
    ]
    return () => cleanups.forEach((cleanup) => cleanup())
  }, [open, props.pointerBlocking])

  return (
    <div style={{ padding: 40 }}>
      <button ref={triggerRef} data-testid={`trigger-${props.id}`} onClick={() => setOpen((value) => !value)}>
        Dismiss
      </button>
      <Portal>
        <div
          hidden={!open}
          ref={contentRef}
          data-testid={`layer-${props.id}`}
          {...getDismissableLayerAttrs(layer)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            transform: "translate3d(var(--x, 0px), var(--y, -100vh), 0)",
            // getPlacement() also writes to --z-index (copying the content's own
            // computed z-index), so use --layer-index directly to avoid the clash.
            zIndex: "var(--layer-index)",
            background: props.background,
            padding: 10,
            ...getDismissableLayerStyle(layer, { pointerEvents: true }),
          }}
        >
          <h1>Sandbox</h1>
          <p>This is a sandbox page.</p>
          {props.children}
        </div>
      </Portal>
    </div>
  )
}

export default function Page() {
  return (
    <main>
      <Popover id="1" background="pink" pointerBlocking>
        <p>This is a popover.</p>
        <input placeholder="Initial...." />
        <Popover id="2" background="green">
          <p>This is a nested popover.</p>
          <input placeholder="Nested 1...." />
          <Popover id="3" background="teal" pointerBlocking>
            <p>This is a nested popover.</p>
            <input placeholder="Nested 2...." />
          </Popover>
        </Popover>
      </Popover>
    </main>
  )
}
