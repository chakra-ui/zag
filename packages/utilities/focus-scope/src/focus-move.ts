import type { FocusContext } from "./focus-context"
import { focusScopeStack } from "./focus-stack"

export type FocusMoveEffectOptions = {
  onMountAutoFocus?: EventListener
  onUnmountAutoFocus?: EventListener
}

const MOUNT_EVENT = "focusmove.mount"
const UNMOUNT_EVENT = "focusmove.unmount"

export function focusMoveEffect(ctx: FocusContext, options: FocusMoveEffectOptions) {
  const { onMountAutoFocus, onUnmountAutoFocus } = options

  const { doc, win, focusScope, node, firstTabbable } = ctx

  focusScopeStack.add(focusScope)

  const previouslyFocusedElement = doc.activeElement as HTMLElement | null
  const hasFocusedCandidate = node.contains(previouslyFocusedElement)

  if (hasFocusedCandidate) return

  const mountEvent = new win.CustomEvent(MOUNT_EVENT, { bubbles: false, cancelable: true })

  if (onMountAutoFocus) {
    node.addEventListener(MOUNT_EVENT, onMountAutoFocus)
  }

  node.dispatchEvent(mountEvent)

  if (mountEvent.defaultPrevented) return

  const first = firstTabbable()
  first?.focus({ preventScroll: true })

  if (doc.activeElement === previouslyFocusedElement) {
    node.focus()
  }

  return () => {
    node.removeEventListener(MOUNT_EVENT, onMountAutoFocus as EventListener)

    setTimeout(() => {
      //
      const unmountEvent = new win.CustomEvent(UNMOUNT_EVENT, { bubbles: false, cancelable: true })

      if (onUnmountAutoFocus) {
        node.addEventListener(UNMOUNT_EVENT, onUnmountAutoFocus)
      }

      node.dispatchEvent(unmountEvent)

      if (!unmountEvent.defaultPrevented) {
        const el = previouslyFocusedElement ?? doc.body
        el.focus({ preventScroll: true })
      }

      // we need to remove the listener after we `dispatchEvent`
      if (onUnmountAutoFocus) {
        node.removeEventListener(UNMOUNT_EVENT, onUnmountAutoFocus)
      }

      focusScopeStack.remove(focusScope)
    })
  }
}
