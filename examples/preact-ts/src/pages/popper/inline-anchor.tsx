import { getInlineRectCoords, getPlacement, getPlacementStyles, inline, type InlineRectCoords } from "@zag-js/popper"
import { useEffect, useRef, useState } from "preact/hooks"
import "@styles/popper.css"

const styles = getPlacementStyles({ placement: "top" })

export default function Page() {
  const termRef = useRef<HTMLAnchorElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const stopRef = useRef<VoidFunction>(undefined)
  const coordsRef = useRef<InlineRectCoords>(undefined)
  const closeRef = useRef<VoidFunction>(() => {})
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const term = termRef.current
    const card = cardRef.current
    if (!term || !card) return

    const onPointerDown = (e: PointerEvent) => {
      if (!term.contains(e.target as Node) && !card.contains(e.target as Node)) close()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    function close() {
      stopRef.current?.()
      stopRef.current = undefined
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
      setOpen(false)
    }
    closeRef.current = close

    const onClick = (e: MouseEvent) => {
      e.preventDefault()
      coordsRef.current = getInlineRectCoords({ element: term, x: e.clientX, y: e.clientY })
      stopRef.current?.()
      document.addEventListener("pointerdown", onPointerDown)
      document.addEventListener("keydown", onKeyDown)
      setOpen(true)
      stopRef.current = getPlacement(term, card, {
        placement: "top",
        gutter: 12,
        middleware: [inline({ getCoords: () => coordsRef.current })],
      })
    }

    term.addEventListener("click", onClick)
    return () => {
      term.removeEventListener("click", onClick)
      close()
    }
  }, [])

  return (
    <main>
      <div className="popper-inline">
        <p className="hint">Click either line of the link to anchor the card to that line.</p>
        <p className="article">
          Every plan includes a free trial, and annual subscriptions are{" "}
          <a
            href="#refund-policy"
            className="term"
            ref={termRef}
            data-testid="inline-term"
            aria-describedby="refund-card"
          >
            eligible for a full refund within 30 days of purchase
          </a>{" "}
          if the product is not a fit.
        </p>
        <div
          className="card"
          id="refund-card"
          ref={cardRef}
          role="tooltip"
          data-testid="inline-card"
          data-open={open ? "true" : "false"}
          style={styles.floating}
        >
          Refunded to your original payment method.
        </div>
      </div>
    </main>
  )
}
