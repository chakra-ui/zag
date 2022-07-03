import { trackDismissableElement } from "@zag-js/dimissable"
import { getPlacement } from "@zag-js/popper"
import { useEffect, useRef, useState } from "react"
import { Portal } from "../components/portal"

function Popover({ children, bg, inert }: { children?: React.ReactNode; bg: string; inert?: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>()
  const buttonRef = useRef<HTMLButtonElement>()

  useEffect(() => {
    if (!open) return
    const cleanup = [
      getPlacement(buttonRef.current, ref.current, {
        placement: "right",
      }),
      trackDismissableElement(ref.current, {
        pointerBlocking: inert,
        onDismiss: () => setOpen(false),
        exclude: [buttonRef.current],
      }),
    ]
    return () => {
      cleanup.forEach((c) => c())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <div style={{ padding: 40 }}>
      <button ref={buttonRef} onClick={() => setOpen((v) => !v)}>
        Dismiss
      </button>
      <Portal>
        <div hidden={!open} ref={ref} style={{ background: bg, padding: 10 }}>
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
      <Popover bg="pink" inert>
        <p>This is a popover.</p>
        <input placeholder="Initial...." />
        <Popover bg="green">
          <p>This is a nested popover.</p>
          <input placeholder="Nested 1...." />
          <Popover bg="teal" inert>
            <p>This is a nested popover.</p>
            <input placeholder="Nested 2...." />
          </Popover>
        </Popover>
      </Popover>
    </div>
  )
}
