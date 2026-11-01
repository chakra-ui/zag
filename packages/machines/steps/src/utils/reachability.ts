import { COMPLETE, type BlockReason, type StepItem } from "../steps.types"
import {
  findItem,
  findItemIndex,
  getEffectiveItems,
  isItemCompleted,
  isItemDisabled,
  isItemInvalid,
  isItemOptional,
} from "./item"

export interface NavContext {
  items: StepItem[]
  value: string | null
  completedValues: string[]
  linear: boolean
}

export type Reachability = { ok: true } | { ok: false; reason: BlockReason; blockedBy: string | null }

const ok: Reachability = { ok: true }

const blocked = (reason: BlockReason, blockedBy: string | null): Reachability => ({ ok: false, reason, blockedBy })

/** Never applies to the current step, or the user would be trapped */
export const isItemLocked = (ctx: NavContext, item: StepItem): boolean =>
  item.editable === false && isItemCompleted(ctx.completedValues, item.value) && item.value !== ctx.value

export const isNavigable = (ctx: NavContext, item: StepItem): boolean =>
  !isItemDisabled(item) && !isItemLocked(ctx, item)

/** Returns -1 when there is none. Never wraps. */
export const findNavigableIndex = (ctx: NavContext, fromIndex: number, step: 1 | -1): number => {
  let i = fromIndex + step
  while (i >= 0 && i < ctx.items.length) {
    const item = ctx.items[i]
    if (item && isNavigable(ctx, item)) return i
    i += step
  }
  return -1
}

/** Prefers forward, then backward. Returns `null` when there is none. */
export const findNearestNavigable = (ctx: NavContext, from: number): string | null => {
  const { items } = ctx
  const at = items[from]
  if (at && isNavigable(ctx, at)) return at.value
  for (let i = from + 1; i < items.length; i++) {
    const item = items[i]
    if (item && isNavigable(ctx, item)) return item.value
  }
  for (let i = Math.min(from, items.length) - 1; i >= 0; i--) {
    const item = items[i]
    if (item && isNavigable(ctx, item)) return item.value
  }
  return null
}

export function getReachability(ctx: NavContext, targetValue: string): Reachability {
  if (targetValue === ctx.value) return ok

  const currentIndex = findItemIndex(ctx.items, ctx.value)
  const currentItem = findItem(ctx.items, ctx.value)

  if (targetValue !== COMPLETE) {
    const target = findItem(ctx.items, targetValue)
    if (target == null) return blocked("disabled", null)
    if (isItemDisabled(target)) return blocked("disabled", targetValue)
    if (isItemLocked(ctx, target)) return blocked("locked", targetValue)
  }

  const targetIndex = findItemIndex(ctx.items, targetValue)

  if (targetIndex <= currentIndex) return ok

  if (currentItem != null && isItemInvalid(currentItem)) {
    return blocked("invalid", currentItem.value)
  }

  // Linear: every earlier step must be settled
  if (ctx.linear) {
    for (let i = 0; i < targetIndex; i++) {
      const item = ctx.items[i]
      if (!item) continue
      if (isItemDisabled(item)) continue
      const completed = isItemCompleted(ctx.completedValues, item.value)
      // An unfinished optional step is settled, even when invalid
      if (isItemOptional(item) && !completed) continue
      if (isItemInvalid(item)) return blocked("invalid", item.value)
      if (completed) continue
      return blocked("incomplete", item.value)
    }
  }

  if (targetValue === COMPLETE) {
    const blocker = getCompletionBlocker(ctx)
    if (blocker !== undefined) return blocked("incomplete", blocker)
  }

  return ok
}

/** The first unfinished required step, `null` for an empty flow, `undefined` when completable */
export function getCompletionBlocker(ctx: Pick<NavContext, "items" | "completedValues">): string | null | undefined {
  const effective = getEffectiveItems(ctx.items)
  if (effective.length === 0) return null
  for (const item of effective) {
    if (isItemCompleted(ctx.completedValues, item.value)) continue
    if (isItemOptional(item)) continue
    return item.value
  }
  return undefined
}

export const isFlowComplete = (ctx: Pick<NavContext, "items" | "completedValues">): boolean =>
  getCompletionBlocker(ctx) === undefined
