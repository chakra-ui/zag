import { addDomEvent, getWindow, raf } from "@zag-js/dom-query"

let previousBodyPosition: Record<string, string> | null = null

interface PositionFixedOptions {
  document: Document
}

export function trackPositionFixed(options: PositionFixedOptions) {
  const { document: doc } = options

  const win = getWindow(doc)
  const bodyEl = doc.body

  let scrollPos = 0

  function set() {
    if (previousBodyPosition !== null) return

    previousBodyPosition = {
      position: bodyEl.style.position,
      top: bodyEl.style.top,
      left: bodyEl.style.left,
      height: bodyEl.style.height,
    }

    const { scrollX, innerHeight } = win

    bodyEl.style.setProperty("position", "fixed", "important")
    bodyEl.style.top = `${-scrollPos}px`
    bodyEl.style.left = `${-scrollX}px`
    bodyEl.style.right = "0px"
    bodyEl.style.height = "auto"

    setTimeout(
      () =>
        raf(() => {
          const bottomBarHeight = innerHeight - win.innerHeight
          if (bottomBarHeight && scrollPos >= innerHeight) {
            bodyEl.style.top = `${-(scrollPos + bottomBarHeight)}px`
          }
        }),
      300,
    )
  }

  function restore() {
    if (previousBodyPosition === null) return

    const y = -parseInt(bodyEl.style.top, 10)
    const x = -parseInt(bodyEl.style.left, 10)

    bodyEl.style.position = previousBodyPosition.position
    bodyEl.style.top = previousBodyPosition.top
    bodyEl.style.left = previousBodyPosition.left
    bodyEl.style.height = previousBodyPosition.height
    bodyEl.style.right = "unset"

    raf(() => {
      win.scrollTo(x, y)
    })

    previousBodyPosition = null
  }

  const exec = () => (scrollPos = win.scrollY)

  exec()
  const cleanup = addDomEvent(win, "scroll", exec)

  return {
    set,
    restore,
    cleanup,
  }
}
