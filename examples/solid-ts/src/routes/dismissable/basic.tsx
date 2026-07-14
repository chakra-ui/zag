import {
  getDismissableLayerAttrs,
  getDismissableLayerStyle,
  trackDismissableElement,
  type LayerSnapshot,
} from "@zag-js/dismissable"
import { getPlacement } from "@zag-js/popper"
import { type JSX, createEffect, createMemo, createSignal, onCleanup } from "solid-js"
import { Portal } from "solid-js/web"

interface PopoverProps {
  background: string
  children?: JSX.Element
  id: string
  pointerBlocking?: boolean
}

function Popover(props: PopoverProps) {
  const [open, setOpen] = createSignal(false)
  const [layer, setLayer] = createSignal<LayerSnapshot | null>(null)
  let contentRef: HTMLDivElement | undefined
  let triggerRef: HTMLButtonElement | undefined

  // Solid's style prop uses setProperty(), which needs kebab-case (unlike React/Vue/Preact's camelCase assignment)
  const layerStyle = createMemo(() => getDismissableLayerStyle(layer(), { pointerEvents: true }))

  createEffect(() => {
    if (!open()) return
    const cleanups = [
      getPlacement(triggerRef, contentRef, { placement: "right" }),
      trackDismissableElement(contentRef ?? null, {
        pointerBlocking: props.pointerBlocking,
        onLayerChange: setLayer,
        onDismiss: () => setOpen(false),
        exclude: [triggerRef ?? null],
      }),
    ]
    onCleanup(() => cleanups.forEach((cleanup) => cleanup()))
  })

  return (
    <div style={{ padding: "40px" }}>
      <button ref={triggerRef} data-testid={`trigger-${props.id}`} onClick={() => setOpen((value) => !value)}>
        Dismiss
      </button>
      <Portal>
        <div
          hidden={!open()}
          ref={contentRef}
          data-testid={`layer-${props.id}`}
          {...getDismissableLayerAttrs(layer())}
          style={{
            position: "fixed",
            top: "0px",
            left: "0px",
            transform: "translate3d(var(--x, 0px), var(--y, -100vh), 0)",
            // getPlacement() also writes to --z-index (copying the content's own
            // computed z-index), so use --layer-index directly to avoid the clash.
            "z-index": "var(--layer-index)",
            background: props.background,
            padding: "10px",
            "--layer-index": layerStyle()["--layer-index"],
            "--nested-layer-count": layerStyle()["--nested-layer-count"],
            "pointer-events": layerStyle().pointerEvents,
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
