import { trackEscapeKeydown } from "./escape-keydown"
import { InteractOutsideOptions, trackInteractOutside } from "./interact-outside"
import { layerStack, LayerType } from "./layer-stack"
import { disablePointerEventsOutside } from "./pointer-event-outside"
import { trackFocusedDescendantRemoval } from "./track-mutation-within"

export type DismissableElementOptions = InteractOutsideOptions & {
  type: LayerType
  id: string
  closeOnEscape?: boolean
  closeOnInteractOutside?: boolean
  disableOutsidePointerEvents?: boolean
  onDismiss: () => void
  onEscapeKeyDown?: (event: KeyboardEvent) => void
  onInteractOutside?: (event: Event) => void
}

export function trackDismissableElement(el: HTMLElement | null, options: DismissableElementOptions) {
  if (!el) return null

  const { id, type, onDismiss, disableOutsidePointerEvents } = options

  layerStack.add({ id, close: onDismiss, ref: el, type })

  const onPointerDownOutside = (event: Event) => {
    options.onPointerDownOutside?.(event)
    options.onInteractOutside?.(event)
    if (!event.defaultPrevented) onDismiss?.()
  }

  const onFocusOutside = (event: Event) => {
    options.onFocusOutside?.(event)
    options.onInteractOutside?.(event)
    if (!event.defaultPrevented) onDismiss?.()
  }

  const onEscapeKeyDown = (event: KeyboardEvent) => {
    if (!layerStack.isTopMost(id)) return
    options.onEscapeKeyDown?.(event)
    if (!event.defaultPrevented) {
      layerStack.close(id)
    }
  }

  const exclude = (target: Element) => {
    return layerStack.getParentRefs(id).some((ref) => ref === target)
  }

  const cleanups = [
    disableOutsidePointerEvents ? disablePointerEventsOutside([el], exclude) : undefined,
    trackFocusedDescendantRemoval(el),
    trackEscapeKeydown(onEscapeKeyDown),
    trackInteractOutside(el, { onFocusOutside, onPointerDownOutside, exclude }),
  ]

  return () => {
    layerStack.remove(id)
    cleanups.forEach((fn) => fn?.())
  }
}
