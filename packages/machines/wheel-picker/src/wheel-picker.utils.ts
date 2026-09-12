import type { CollectionItem, ListCollection } from "@zag-js/collection"
import type { WheelPickerRenderItem } from "./wheel-picker.types"

export const DRAG_THRESHOLD = 5
export const MAX_VELOCITY = 30
export const OVERSCROLL_RESISTANCE = 0.3
export const WHEEL_THROTTLE = 100

export interface WheelGeometry {
  containerHeight: number
  halfItemHeight: number
  itemAngle: number
  quarterCount: number
  radius: number
  visibleCount: number
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max))
}

export function normalizeScroll(scroll: number, itemCount: number) {
  if (itemCount === 0) return 0
  return ((scroll % itemCount) + itemCount) % itemCount
}

export function normalizeVisibleCount(value: number) {
  if (!Number.isFinite(value)) return 20
  return Math.max(4, Math.floor(value / 4) * 4)
}

export function getWheelGeometry(visibleCount: number, itemHeight: number): WheelGeometry {
  const normalizedVisibleCount = normalizeVisibleCount(visibleCount)
  const normalizedItemHeight = Math.max(1, itemHeight)
  const itemAngle = 360 / normalizedVisibleCount
  const radius = normalizedItemHeight / Math.tan((itemAngle * Math.PI) / 180)

  return {
    containerHeight: Math.round(radius * 2 + normalizedItemHeight * 0.25),
    halfItemHeight: normalizedItemHeight * 0.5,
    itemAngle,
    quarterCount: normalizedVisibleCount >> 2,
    radius,
    visibleCount: normalizedVisibleCount,
  }
}

export function getExpandedItems<T extends CollectionItem>(items: T[], infinite: boolean, visibleCount: number) {
  if (!infinite || items.length === 0) return items

  const result: T[] = []
  const halfCount = Math.ceil(normalizeVisibleCount(visibleCount) / 2)

  while (result.length < halfCount) result.push(...items)
  return result
}

export function getRenderItems<T extends CollectionItem>(
  items: T[],
  infinite: boolean,
  visibleCount: number,
): WheelPickerRenderItem<T>[] {
  const expandedItems = getExpandedItems(items, infinite, visibleCount)
  const result = expandedItems.map((item, index) => ({ item, index, key: `item:${index}` }))

  if (!infinite || expandedItems.length === 0) return result

  const { quarterCount } = getWheelGeometry(visibleCount, 1)

  for (let index = 0; index < quarterCount; index++) {
    const prependIndex = -index - 1
    const appendIndex = expandedItems.length + index

    result.unshift({
      item: expandedItems[expandedItems.length - index - 1]!,
      index: prependIndex,
      key: `item:${prependIndex}`,
    })
    result.push({ item: expandedItems[index]!, index: appendIndex, key: `item:${appendIndex}` })
  }

  return result
}

export function getHighlightItems<T extends CollectionItem>(
  items: T[],
  infinite: boolean,
  visibleCount: number,
): WheelPickerRenderItem<T>[] {
  const expandedItems = getExpandedItems(items, infinite, visibleCount)
  const result = expandedItems.map((item, index) => ({ item, index, key: `highlight:${index}` }))

  if (!infinite || expandedItems.length === 0) return result

  result.unshift({ item: expandedItems.at(-1)!, index: -1, key: "highlight:-1" })
  result.push({ item: expandedItems[0]!, index: expandedItems.length, key: `highlight:${expandedItems.length}` })

  return result
}

export function findItemIndex<T extends CollectionItem>(
  items: T[],
  collection: ListCollection<T>,
  value: string | null,
) {
  if (value == null) return -1
  return items.findIndex((item) => collection.getItemValue(item) === value)
}

export function findNearestEnabledIndex<T extends CollectionItem>(
  startIndex: number,
  direction: 1 | -1,
  items: T[],
  infinite: boolean,
  collection: ListCollection<T>,
) {
  if (items.length === 0) return -1
  if (!items.some((item) => !collection.getItemDisabled(item))) return -1

  const search = (searchDirection: 1 | -1) => {
    let index = startIndex

    for (let attempts = 0; attempts < items.length; attempts++) {
      index += searchDirection

      if (infinite) {
        index = normalizeScroll(index, items.length)
      } else if (index < 0 || index >= items.length) {
        return -1
      }

      if (!collection.getItemDisabled(items[index] ?? null)) return index
    }

    return -1
  }

  const nextIndex = search(direction)
  return nextIndex === -1 ? search(direction === 1 ? -1 : 1) : nextIndex
}

export function resolveEnabledIndex<T extends CollectionItem>(
  index: number,
  direction: 1 | -1,
  items: T[],
  infinite: boolean,
  collection: ListCollection<T>,
) {
  if (items.length === 0) return -1

  const normalizedIndex = infinite ? normalizeScroll(index, items.length) : clamp(index, 0, items.length - 1)
  if (!collection.getItemDisabled(items[normalizedIndex] ?? null)) return normalizedIndex

  return findNearestEnabledIndex(normalizedIndex, direction, items, infinite, collection)
}

export function getClickedStep(clientY: number, top: number, geometry: WheelGeometry, itemHeight: number) {
  let position = 0
  const offset = clientY - top

  for (let index = geometry.quarterCount - 1; index >= -geometry.quarterCount + 1; index--) {
    const angle = index * geometry.itemAngle
    const segmentLength = itemHeight * Math.cos((angle * Math.PI) / 180)
    const end = position + segmentLength

    if (offset >= position && offset <= end) {
      const clickedSegmentIndex = geometry.quarterCount - 1 - index
      const step = (geometry.quarterCount - clickedSegmentIndex - 1) * -1
      return step === 0 ? 0 : step
    }

    position = end
  }

  return 0
}

export function getStepDuration(distance: number, scrollSensitivity: number) {
  if (distance === 0) return 0
  return Math.sqrt(distance / Math.max(0.001, scrollSensitivity)) * 1000
}

export interface InertiaTargetOptions {
  current: number
  itemCount: number
  velocity: number
  dragSensitivity: number
  infinite: boolean
}

export function getInertiaTarget(options: InertiaTargetOptions) {
  const { current, itemCount, infinite } = options
  const maxIndex = Math.max(0, itemCount - 1)
  const velocity = clamp(options.velocity, -MAX_VELOCITY, MAX_VELOCITY)
  const decelerationMagnitude = Math.max(0.001, options.dragSensitivity * 10)

  if (!infinite && (current < 0 || current > maxIndex)) {
    const target = clamp(current, 0, maxIndex)
    const duration = Math.sqrt(Math.abs(current - target) / 10) * 1000
    return { duration, target }
  }

  const deceleration = velocity > 0 ? -decelerationMagnitude : decelerationMagnitude
  const freeDuration = Math.abs(velocity / deceleration)
  const distance = velocity * freeDuration + 0.5 * deceleration * freeDuration * freeDuration
  let target = Math.round(current + distance)

  if (!infinite) target = clamp(target, 0, maxIndex)

  const adjustedDistance = Math.abs(target - current)
  const duration = Math.sqrt(adjustedDistance / decelerationMagnitude) * 1000
  return { duration, target }
}
