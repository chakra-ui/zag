import { add } from "@zag-js/utils"
import { COMPLETE, type BlockReason } from "../steps.types"
import { findItem, findItemIndex, isItemDisabled, isItemInvalid, isItemOptional } from "./item"
import { findNavigableIndex, getReachability, isItemLocked, type NavContext } from "./reachability"

export type NavResult =
  | { ok: true; value: string; completedValues: string[] }
  | { ok: false; targetValue: string; reason: BlockReason; blockedBy: string | null }

/** Pure: a blocked `next` must not mark the step completed. `null` means no-op. */
export function getNextResult(ctx: NavContext, { skip = false }: { skip?: boolean } = {}): NavResult | null {
  const currentItem = findItem(ctx.items, ctx.value)
  if (currentItem == null) return null
  if (skip && !isItemOptional(currentItem)) return null

  const currentIndex = findItemIndex(ctx.items, ctx.value)

  if (!skip && isItemInvalid(currentItem)) {
    const probe = findNavigableIndex(ctx, currentIndex, 1)
    const targetValue = probe === -1 ? COMPLETE : ctx.items[probe]!.value
    return { ok: false, targetValue, reason: "invalid", blockedBy: currentItem.value }
  }

  const completedValues =
    skip || ctx.completedValues.includes(currentItem.value)
      ? ctx.completedValues
      : add(ctx.completedValues, currentItem.value)

  // Skip bypasses the current step's invalid gate
  const items =
    skip && isItemInvalid(currentItem)
      ? ctx.items.map((item) => (item === currentItem ? { ...item, invalid: false } : item))
      : ctx.items

  const nextCtx: NavContext = { ...ctx, items, completedValues }
  const index = findNavigableIndex(nextCtx, currentIndex, 1)
  const targetValue = index === -1 ? COMPLETE : nextCtx.items[index]!.value

  const reachability = getReachability(nextCtx, targetValue)
  if (!reachability.ok) {
    return { ok: false, targetValue, reason: reachability.reason, blockedBy: reachability.blockedBy }
  }

  return { ok: true, value: targetValue, completedValues }
}

export function getPrevResult(ctx: NavContext, fromIndex: number): NavResult | null {
  if (fromIndex === -1) return null

  let blockedByLock: string | null = null
  for (let i = fromIndex - 1; i >= 0; i--) {
    const item = ctx.items[i]
    if (!item || isItemDisabled(item)) continue
    if (isItemLocked(ctx, item)) {
      blockedByLock ??= item.value
      continue
    }
    return { ok: true, value: item.value, completedValues: ctx.completedValues }
  }

  if (blockedByLock != null) {
    return { ok: false, targetValue: blockedByLock, reason: "locked", blockedBy: blockedByLock }
  }
  return null
}

export const isCompletingResult = (result: NavResult | null): boolean =>
  result?.ok === true && result.value === COMPLETE
