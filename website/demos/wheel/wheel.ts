import { getByTypeahead, type TypeaheadState } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"

export interface WheelItem {
  value: string
  label: string
  disabled?: boolean
}

export interface WheelProps {
  /** Unique id, used to build the ids of each part */
  id: string
  items: WheelItem[]
  value: string
  onValueChange: (value: string) => void
  /** Accessible name of the wheel */
  label: string
  /** Repeat the items so the wheel never reaches an end */
  loop?: boolean
  /** Row height in pixels */
  itemHeight?: number
  /** Number of rows in view. Keep it odd so one row sits in the middle */
  visibleCount?: number
  /** Name of the hidden input, for native forms */
  name?: string
}

// How many times a looping wheel repeats its items. The user starts in the
// middle copy and gets moved back to it whenever a scroll ends, so a handful
// of copies on each side is plenty.
const COPIES = 7
const MIDDLE = Math.floor(COPIES / 2)

const defaults = { itemHeight: 36, visibleCount: 5, loop: false }

export const getViewportId = (id: string) => `wheel:${id}:viewport`
export const getLabelId = (id: string) => `wheel:${id}:label`
export const getViewportEl = (id: string) =>
  document.getElementById(getViewportId(id))

export function resolve(props: WheelProps) {
  return { ...defaults, ...props }
}

/** Every rendered row. A looping wheel renders its items `COPIES` times */
export function getRows(props: WheelProps) {
  const { items, loop } = resolve(props)
  const copies = loop ? COPIES : 1
  return Array.from({ length: items.length * copies }, (_, row) => ({
    row,
    item: items[row % items.length],
  }))
}

/** The row closest to `fromRow` that shows `value` */
export function getRowOf(props: WheelProps, value: string, fromRow?: number) {
  const { items, loop } = resolve(props)
  const index = items.findIndex((item) => item.value === value)
  if (index === -1) return -1
  if (!loop) return index
  const n = items.length
  const start = fromRow ?? MIDDLE * n + index
  const copy = Math.round((start - index) / n)
  return copy * n + index
}

/** The row in the middle of the viewport */
export function getCenterRow(props: WheelProps, el: HTMLElement) {
  return Math.round(el.scrollTop / resolve(props).itemHeight)
}

export function scrollToRow(
  props: WheelProps,
  el: HTMLElement,
  row: number,
  behavior: ScrollBehavior,
) {
  el.scrollTo({ top: row * resolve(props).itemHeight, behavior })
}

/**
 * The row `step` enabled rows away from `fromRow`, in the direction of `step`.
 * Rows run on forever when the wheel loops, and stop at the ends otherwise.
 */
export function stepRow(props: WheelProps, fromRow: number, step: number) {
  const { items, loop } = resolve(props)
  const rowCount = loop ? items.length * COPIES : items.length
  const dir = Math.sign(step)
  let row = fromRow
  let found = fromRow
  let remaining = Math.abs(step)

  while (remaining > 0) {
    row += dir
    if (row < 0 || row >= rowCount) break
    if (items[row % items.length].disabled) continue
    found = row
    remaining--
  }

  return found
}

// While a keyboard move animates, the next key press starts from where the
// wheel is heading, not from the row it happens to be passing
const pendingRows = new Map<string, number>()

export const hasPendingRow = (id: string) => pendingRows.has(id)

/**
 * Called when scrolling stops. Picks the row in the middle, skips disabled
 * rows, and moves a looping wheel back to its middle copy.
 */
export function settle(props: WheelProps, el: HTMLElement) {
  const { items, loop } = resolve(props)
  const n = items.length
  const row = getCenterRow(props, el)
  const item = items[((row % n) + n) % n]

  pendingRows.delete(props.id)

  if (item.disabled) {
    let next = stepRow(props, row, 1)
    if (next === row) next = stepRow(props, row, -1)
    scrollToRow(props, el, next, "smooth")
    return
  }

  // Jump by whole copies. Every copy looks the same, so nothing moves on screen
  if (loop && Math.abs(Math.floor(row / n) - MIDDLE) > 1) {
    scrollToRow(props, el, getRowOf(props, item.value), "instant")
  }

  if (item.value !== props.value) props.onValueChange(item.value)
}

/** Calls `onEnd` when a scroll, including touch momentum, comes to rest */
export function trackScrollEnd(el: HTMLElement, onEnd: () => void) {
  // Safari added `scrollend` in 26.2. Older browsers wait for scroll events to stop
  if ("onscrollend" in window) {
    el.addEventListener("scrollend", onEnd)
    return () => el.removeEventListener("scrollend", onEnd)
  }
  let timer: ReturnType<typeof setTimeout>
  const onScroll = () => {
    clearTimeout(timer)
    timer = setTimeout(onEnd, 120)
  }
  el.addEventListener("scroll", onScroll, { passive: true })
  return () => {
    clearTimeout(timer)
    el.removeEventListener("scroll", onScroll)
  }
}

// Typed characters build up across key presses, so the buffer has to outlive a render
const typeaheads = new Map<string, TypeaheadState>()

export function connect<T extends PropTypes>(
  props: WheelProps,
  normalize: NormalizeProps<T>,
) {
  const { id, items, value, label, name, itemHeight, visibleCount } =
    resolve(props)
  const index = items.findIndex((item) => item.value === value)
  if (!typeaheads.has(id))
    typeaheads.set(id, { ...getByTypeahead.defaultOptions })
  const typeahead = typeaheads.get(id)!
  const pad = ((visibleCount - 1) / 2) * itemHeight

  return {
    getRootProps() {
      return normalize.element({
        "data-wheel-root": id,
        style: {
          "--wheel-item-height": `${itemHeight}px`,
          "--wheel-visible-count": visibleCount,
        },
      })
    },

    getLabelProps() {
      return normalize.element({ "data-wheel-label": id, id: getLabelId(id) })
    },

    getViewportProps() {
      return normalize.element({
        "data-wheel-viewport": id,
        id: getViewportId(id),
        role: "spinbutton",
        tabIndex: 0,
        "aria-label": label,
        "aria-valuenow": index,
        "aria-valuemin": 0,
        "aria-valuemax": items.length - 1,
        "aria-valuetext": items[index]?.label,
        style: {
          height: `${itemHeight * visibleCount}px`,
          overflowY: "auto",
          scrollSnapType: "y mandatory",
          scrollbarWidth: "none",
          overscrollBehavior: "contain",
          paddingBlock: `${pad}px`,
        },
        onKeyDown(event) {
          const el = event.currentTarget as HTMLElement
          const from = pendingRows.get(id) ?? getCenterRow(props, el)
          const n = items.length
          const copyStart = from - (from % n)

          const keyMap: Record<string, () => number> = {
            ArrowDown: () => stepRow(props, from, 1),
            ArrowUp: () => stepRow(props, from, -1),
            PageDown: () => stepRow(props, from, visibleCount - 1),
            PageUp: () => stepRow(props, from, -(visibleCount - 1)),
            Home: () => stepRow(props, copyStart - 1, 1),
            End: () => stepRow(props, copyStart + n, -1),
          }

          let row = keyMap[event.key]?.()

          if (row === undefined && getByTypeahead.isValidEvent(event)) {
            const searchable = items
              .filter((item) => !item.disabled)
              .map((item) => ({ id: item.value, textContent: item.label }))
            const match = getByTypeahead(searchable, {
              state: typeahead,
              activeId: value,
              key: event.key,
            })
            if (match) row = getRowOf(props, match.id, from)
          }

          if (row === undefined) return
          event.preventDefault()
          // Already there, so nothing scrolls and no scrollend would clear the pending row
          if (row === getCenterRow(props, el)) return

          pendingRows.set(id, row)
          scrollToRow(props, el, row, "smooth")
          const next = items[row % n].value
          if (next !== value) props.onValueChange(next)
        },
      })
    },

    getItemGroupProps() {
      // The spinbutton announces the value, so the rows are hidden from assistive tech
      return normalize.element({
        "data-wheel-item-group": id,
        "aria-hidden": true,
      })
    },

    getItemProps(row: number) {
      const item = items[row % items.length]
      return normalize.element({
        "data-wheel-item": id,
        "data-value": item.value,
        "data-selected": item.value === value ? "" : undefined,
        "data-disabled": item.disabled ? "" : undefined,
        style: { height: `${itemHeight}px`, scrollSnapAlign: "center" },
      })
    },

    getHighlightProps() {
      return normalize.element({
        "data-wheel-highlight": id,
        "aria-hidden": true,
        style: {
          position: "absolute",
          insetInline: 0,
          top: `${pad}px`,
          height: `${itemHeight}px`,
          pointerEvents: "none",
        },
      })
    },

    getHiddenInputProps() {
      return normalize.input({ type: "hidden", name, value })
    },
  }
}
