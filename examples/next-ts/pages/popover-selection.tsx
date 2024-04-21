/**
 * Credits to Ariakit for inspiration
 * https://ariakit.org/examples/popover-selection
 */

import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useEffect, useId, useRef } from "react"

export default function Page() {
  const divRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const [state, send] = useMachine(
    popover.machine({
      id: useId(),
      autoFocus: false,
      positioning: {
        placement: "top",
        getAnchorRect() {
          const selection = divRef.current?.ownerDocument.getSelection()
          if (!selection?.rangeCount) return null
          const range = selection.getRangeAt(0)
          return range.getBoundingClientRect()
        },
      },
    }),
  )

  const api = popover.connect(state, send, normalizeProps)

  function hasSelectionWithin(el?: Element | null) {
    if (!el) return false

    const selection = el.ownerDocument.getSelection()
    if (!selection?.rangeCount) return false

    const range = selection.getRangeAt(0)
    if (range.collapsed) return false

    return !!el.contains(range.commonAncestorContainer)
  }

  useEffect(() => {
    const content = contentRef.current
    const node = divRef.current

    if (!content) return
    if (!node) return

    const doc = node.ownerDocument || document

    const onMouseUp = () => {
      if (!hasSelectionWithin(node)) return
      api.reposition()
      api.setOpen(true)
    }

    const onSelect = () => {
      if (hasSelectionWithin(node)) {
        return api.reposition()
      }
      api.setOpen(false)
    }

    doc.addEventListener("mouseup", onMouseUp)
    doc.addEventListener("selectionchange", onSelect)

    return () => {
      doc.removeEventListener("mouseup", onMouseUp)
      doc.removeEventListener("selectionchange", onSelect)
    }
  }, [api])

  return (
    <main className="popover">
      <div ref={divRef} style={{ maxWidth: "500px", fontSize: "20px" }}>
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Odio, sed fuga necessitatibus aliquid expedita atque?
        Doloremque ea sequi totam laudantium laboriosam repellat quasi commodi omnis aut nulla. Numquam, beatae maxime.
      </div>
      <div data-part="root">
        <div {...api.positionerProps}>
          <div ref={contentRef} data-testid="popover-content" className="popover-content" {...api.contentProps}>
            <div {...api.arrowProps}>
              <div {...api.arrowTipProps} />
            </div>
            <button>Save</button>
            <button>Cancel</button>
            <button>Share</button>
          </div>
        </div>
      </div>
    </main>
  )
}
