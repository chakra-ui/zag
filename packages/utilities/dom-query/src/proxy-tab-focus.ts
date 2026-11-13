import { addDomEvent } from "./event"
import { contains, getActiveElement, isActiveElement } from "./node"
import { raf } from "./raf"
import { getAdjacentTabbable, getTabbableEdges, type GetShadowRootOption } from "./tabbable"
import type { MaybeElement, MaybeElementOrFn } from "./types"

export interface ProxyTabFocusOptions<T = MaybeElement> {
  triggerElement?: T | undefined
  onFocus?: ((elementToFocus: HTMLElement) => void) | undefined
  onFocusEnter?: VoidFunction | undefined
  defer?: boolean | undefined
  getShadowRoot?: GetShadowRootOption | undefined
}

function resolveElement(value: MaybeElementOrFn | undefined): MaybeElement {
  if (value == null) return null
  return typeof value === "function" ? value() : value
}

function proxyTabFocusImpl(container: MaybeElementOrFn, options: ProxyTabFocusOptions<MaybeElementOrFn> = {}) {
  const { triggerElement, onFocus, onFocusEnter, getShadowRoot } = options

  const initial = resolveElement(container) ?? resolveElement(triggerElement)
  const doc = initial?.ownerDocument || document

  function onKeyDown(event: KeyboardEvent) {
    if (event.key !== "Tab") return

    // Resolve per keypress so late-mounted / portalled nodes stay correct
    const content = resolveElement(container)
    const trigger = resolveElement(triggerElement)
    if (!content) return

    const [firstTabbable, lastTabbable] = getTabbableEdges(content, { includeContainer: true, getShadowRoot })
    const isEmptyAndFocused = !firstTabbable && !lastTabbable && contains(content, getActiveElement(doc))

    let elementToFocus: MaybeElement | undefined = null

    // Cheap paths first — avoid scanning body tabbables unless exiting/re-entering content
    if (event.shiftKey && (isActiveElement(firstTabbable) || isEmptyAndFocused)) {
      // Shift+Tab from first item → trigger
      elementToFocus = trigger
    } else if (!event.shiftKey && isActiveElement(trigger)) {
      // Tab from trigger → first item
      onFocusEnter?.()
      elementToFocus = firstTabbable
    } else if (!event.shiftKey && (isActiveElement(lastTabbable) || isEmptyAndFocused)) {
      // Tab from last item → next after trigger (outside content)
      elementToFocus = getAdjacentTabbable(trigger ?? null, { exclude: content, getShadowRoot })
    } else if (event.shiftKey) {
      // Shift+Tab from next-after-trigger → last item
      const nextTabbableAfterTrigger = getAdjacentTabbable(trigger ?? null, { exclude: content, getShadowRoot })
      if (isActiveElement(nextTabbableAfterTrigger)) {
        onFocusEnter?.()
        elementToFocus = lastTabbable
      }
    }

    if (!elementToFocus) return

    event.preventDefault()

    if (typeof onFocus === "function") {
      onFocus(elementToFocus)
    } else {
      elementToFocus.focus()
    }
  }

  return addDomEvent(doc, "keydown", onKeyDown, true)
}

export function proxyTabFocus(container: MaybeElementOrFn, options: ProxyTabFocusOptions<MaybeElementOrFn>) {
  const { defer, ...restOptions } = options
  const func = defer ? raf : (v: any) => v()
  const cleanups: (VoidFunction | undefined)[] = []
  cleanups.push(
    func(() => {
      cleanups.push(proxyTabFocusImpl(container, restOptions))
    }),
  )
  return () => {
    cleanups.forEach((fn) => fn?.())
  }
}
