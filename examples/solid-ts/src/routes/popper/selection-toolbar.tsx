import { getPlacement, getPlacementStyles } from "@zag-js/popper"
import { createSignal, onSettled } from "solid-js"
import "@styles/popper.css"

const styles = getPlacementStyles({ placement: "top", strategy: "fixed" })

export default function Page() {
  let paragraphRef: HTMLParagraphElement | undefined
  let toolbarRef: HTMLDivElement | undefined
  const [open, setOpen] = createSignal(false)
  const [status, setStatus] = createSignal("")

  onSettled(() => {
    const paragraph = paragraphRef
    const toolbar = toolbarRef
    if (!paragraph || !toolbar) return

    let stop: VoidFunction | undefined

    const close = () => {
      stop?.()
      stop = undefined
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
      stop?.()
      setOpen(true)
      stop = getPlacement(null, toolbar, {
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
      stop?.()
    }
  })

  return (
    <main>
      <div class="popper-selection">
        <p class="hint">Select any words to open the toolbar above them.</p>
        <p class="article" ref={paragraphRef} data-testid="paragraph">
          Zag state machines keep interaction logic out of your components. Each machine describes the states a widget
          can be in, the events that move it between them, and the effects it runs along the way, so the same behavior
          works in every framework.
        </p>
        <div
          class="format-bar"
          ref={toolbarRef}
          role="toolbar"
          aria-label="Text formatting"
          data-testid="selection-toolbar"
          data-open={open() ? "true" : "false"}
          style={styles.floating}
          onMouseDown={(e) => e.preventDefault()}
        >
          {["Bold", "Link", "Comment"].map((label) => (
            <button type="button" onClick={() => setStatus(`${label} applied`)}>
              {label}
            </button>
          ))}
        </div>
        <p class="status" role="status">
          {status()}
        </p>
      </div>
    </main>
  )
}
