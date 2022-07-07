import { focusContainmentEffect, FocusContainmentOptions } from "./focus-containment"
import { createFocusContext } from "./focus-context"
import { focusGuardEffect } from "./focus-guard"
import { focusMoveEffect, FocusMoveEffectOptions } from "./focus-move"
import { focusOnChildUnmountEffect } from "./focus-on-child-unmount"
import { focusOutsideEffect } from "./focus-outside"

export type TrapFocusOptions = FocusMoveEffectOptions &
  FocusContainmentOptions & {
    strict?: boolean
    portalled?: boolean
  }

export function trapFocus(node: HTMLElement | null, options: TrapFocusOptions = {}) {
  if (!node) return

  const { strict = true, portalled, loop = true } = options

  const ctx = createFocusContext(node)

  const cleanups = new Set<VoidFunction | undefined>()

  cleanups.add(focusMoveEffect(ctx, options))
  cleanups.add(focusContainmentEffect(ctx, { loop }))

  if (strict) {
    cleanups.add(focusOutsideEffect(ctx))
    cleanups.add(focusOnChildUnmountEffect(ctx))
  }

  if (portalled) {
    cleanups.add(focusGuardEffect(ctx))
  }

  return () => {
    cleanups.forEach((cleanup) => cleanup?.())
  }
}
