import { raf } from "./raf"
import { getNextTabbable, getTabbableEdges } from "./tabbable"

type MaybeElement = HTMLElement | null
type NodeOrFn = MaybeElement | (() => MaybeElement)

interface ProxyTabFocusOptions<T = MaybeElement> {
  triggerElement?: T
  onFocus?: (elementToFocus: HTMLElement) => void
  defer?: boolean
}

/**
 * Proxies tab focus within a container to a reference element
 * when the container is rendered in a portal
 */

function proxyTabFocusImpl(container: MaybeElement, options: ProxyTabFocusOptions = {}) {
  const { triggerElement, onFocus } = options

  const doc = container?.ownerDocument || document
  const body = doc.body

  function onKeyDown(event: KeyboardEvent) {
    if (event.key !== "Tab") return

    let elementToFocus: MaybeElement | undefined = null

    // get all tabbable elements within the container
    const [firstTabbable, lastTabbable] = getTabbableEdges(container, true)

    const noTabbableElements = !firstTabbable && !lastTabbable

    // if we're focused on the first tabbable element and the user tabs backwards
    // we want to focus the reference element
    if (event.shiftKey && (doc.activeElement === firstTabbable || noTabbableElements)) {
      elementToFocus = triggerElement
    } else if (!event.shiftKey && doc.activeElement === triggerElement) {
      // if we're focused on the reference element and the user tabs forwards
      // we want to focus the first tabbable element
      elementToFocus = firstTabbable
    } else if (!event.shiftKey && (doc.activeElement === lastTabbable || noTabbableElements)) {
      // if we're focused on the last tabbable element and the user tabs forwards
      // we want to focus the next tabbable element after the reference element
      elementToFocus = getNextTabbable(body, triggerElement)
    }

    if (!elementToFocus) return

    event.preventDefault()

    if (typeof onFocus === "function") {
      onFocus(elementToFocus)
    } else {
      elementToFocus.focus()
    }
  }

  // listen for the tab key in the capture phase
  doc?.addEventListener("keydown", onKeyDown, true)

  return () => {
    doc?.removeEventListener("keydown", onKeyDown, true)
  }
}

export function proxyTabFocus(container: NodeOrFn, options: ProxyTabFocusOptions<NodeOrFn>) {
  const { defer, triggerElement, ...restOptions } = options
  const func = defer ? raf : (v: any) => v()
  const cleanups: (VoidFunction | undefined)[] = []
  cleanups.push(
    func(() => {
      const node = typeof container === "function" ? container() : container
      const trigger = typeof triggerElement === "function" ? triggerElement() : triggerElement
      cleanups.push(proxyTabFocusImpl(node, { triggerElement: trigger, ...restOptions }))
    }),
  )
  return () => {
    cleanups.forEach((fn) => fn?.())
  }
}
