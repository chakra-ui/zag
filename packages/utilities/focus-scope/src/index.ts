import { focusContainmentEffect, type FocusContainmentOptions } from "./focus-containment"
import { createFocusContext } from "./focus-context"
import { focusGuardEffect } from "./focus-guard"
import { focusMoveEffect, type FocusMoveEffectOptions } from "./focus-move"
import { focusOnChildUnmountEffect } from "./focus-on-child-unmount"
import { focusOutsideEffect } from "./focus-outside"

export type TrapFocusOptions = FocusMoveEffectOptions &
  FocusContainmentOptions & {
    contain?: boolean
    guards?: boolean
  }

export function trapFocus(node: HTMLElement | null, options: TrapFocusOptions = {}) {
  if (!node) return

  const { contain, guards, loop = true } = options

  const ctx = createFocusContext(node)

  const cleanups = new Set<VoidFunction | undefined>()

  if (contain) {
    cleanups.add(focusOnChildUnmountEffect(ctx))
    cleanups.add(focusOutsideEffect(ctx))
  }

  cleanups.add(focusMoveEffect(ctx, options))
  cleanups.add(focusContainmentEffect(ctx, { loop }))

  if (guards) {
    cleanups.add(focusGuardEffect(ctx))
  }

  return () => {
    cleanups.forEach((cleanup) => cleanup?.())
  }
}
