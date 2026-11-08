"use client"

import { getPlacement, getPlacementStyles } from "@zag-js/popper"
import { useEffect, useRef, useState } from "react"
import "@styles/popper.css"

const styles = getPlacementStyles({ placement: "top", strategy: "fixed" })

export default function Page() {
  const paragraphRef = useRef<HTMLParagraphElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const stopRef = useRef<VoidFunction>(undefined)
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState("")

  useEffect(() => {
    const paragraph = paragraphRef.current
    const toolbar = toolbarRef.current
    if (!paragraph || !toolbar) return

    const close = () => {
      stopRef.current?.()
      stopRef.current = undefined
      setOpen(false)
    }

    const onSelectionChange = () => {
      const selection = document.getSelection()
      const inside =
        selection &&
        !selection.isCollapsed &&
        selection.rangeCount > 0 &&
        paragraph.contains(selection.anchorNode) &&
        paragraph.contains(selection.focusNode)
      if (!inside) return close()

      const range = selection.getRangeAt(0).cloneRange()
      stopRef.current?.()
      setOpen(true)
      stopRef.current = getPlacement(null, toolbar, {
        placement: "top",
        strategy: "fixed",
        gutter: 14,
        getAnchorElement: () => ({
          contextElement: paragraph,
          getBoundingClientRect: () => range.getBoundingClientRect(),
        }),
      })
    }

    document.addEventListener("selectionchange", onSelectionChange)
    return () => {
      document.removeEventListener("selectionchange", onSelectionChange)
      stopRef.current?.()
    }
  }, [])

  return (
    <main>
      <div className="popper-selection">
        <p className="hint">Select any words to open the toolbar above them.</p>
        <p className="article" ref={paragraphRef} data-testid="paragraph">
          Zag state machines keep interaction logic out of your components. Each machine describes the states a widget
          can be in, the events that move it between them, and the effects it runs along the way, so the same behavior
          works in every framework.
        </p>
        <div
          className="format-bar"
          ref={toolbarRef}
          role="toolbar"
          tabIndex={-1}
          aria-label="Text formatting"
          data-testid="selection-toolbar"
          data-open={open ? "true" : "false"}
          style={styles.floating}
          onMouseDown={(e) => e.preventDefault()}
        >
          {["Bold", "Link", "Comment"].map((label) => (
            <button key={label} type="button" onClick={() => setStatus(`${label} applied`)}>
              {label}
            </button>
          ))}
        </div>
        <p className="status" role="status">
          {status}
        </p>
      </div>
    </main>
  )
}
