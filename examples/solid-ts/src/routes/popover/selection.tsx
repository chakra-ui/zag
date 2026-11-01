import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, onCleanup, onMount } from "solid-js"
import "@styles/popover.css"

function hasSelectionWithin(el?: Element | null) {
  if (!el) return false

  const selection = el.ownerDocument.getSelection()
  if (!selection?.rangeCount) return false

  const range = selection.getRangeAt(0)
  if (range.collapsed) return false

  return !!el.contains(range.commonAncestorContainer)
}

export default function Page() {
  let divRef: HTMLDivElement | undefined
  let contentRef: HTMLDivElement | undefined

  const service = useMachine(popover.machine, {
    id: createUniqueId(),
    autoFocus: false,
    positioning: {
      placement: "top",
      getAnchorRect() {
        const selection = divRef?.ownerDocument.getSelection()
        if (!selection?.rangeCount) return null
        const range = selection.getRangeAt(0)
        return range.getBoundingClientRect()
      },
    },
  })

  const api = createMemo(() => popover.connect(service, normalizeProps))

  onMount(() => {
    const node = divRef
    if (!contentRef || !node) return

    const doc = node.ownerDocument || document

    const onMouseUp = () => {
      if (!hasSelectionWithin(node)) return
      api().reposition()
      api().setOpen(true)
    }

    const onSelect = () => {
      if (hasSelectionWithin(node)) {
        return api().reposition()
      }
      api().setOpen(false)
    }

    doc.addEventListener("mouseup", onMouseUp)
    doc.addEventListener("selectionchange", onSelect)

    onCleanup(() => {
      doc.removeEventListener("mouseup", onMouseUp)
      doc.removeEventListener("selectionchange", onSelect)
    })
  })

  return (
    <main class="popover">
      <div ref={divRef} style={{ "max-width": "500px", "font-size": "20px" }}>
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Odio, sed fuga necessitatibus aliquid expedita atque?
        Doloremque ea sequi totam laudantium laboriosam repellat quasi commodi omnis aut nulla. Numquam, beatae maxime.
      </div>
      <div data-part="root">
        <div {...api().getPositionerProps()}>
          <div ref={contentRef} data-testid="popover-content" class="popover-content" {...api().getContentProps()}>
            <div {...api().getArrowProps()}>
              <div {...api().getArrowTipProps()} />
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
