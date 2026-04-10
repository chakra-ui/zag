import type { Scope } from "@zag-js/core"
import type { Point } from "@zag-js/types"
import { roundToDpr, wrap } from "@zag-js/utils"
import { parts } from "./number-input.anatomy"
import type { HintValue } from "./number-input.types"

// ID generators — only for parts referenced by ARIA attributes
export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getInputId = (ctx: Scope) => ctx.ids?.input ?? `${ctx.id}:input`
export const getIncrementTriggerId = (ctx: Scope) => ctx.ids?.incrementTrigger ?? `${ctx.id}:inc`
export const getDecrementTriggerId = (ctx: Scope) => ctx.ids?.decrementTrigger ?? `${ctx.id}:dec`
export const getScrubberId = (ctx: Scope) => ctx.ids?.scrubber ?? `${ctx.id}:scrubber`
export const getScrubberCursorId = (ctx: Scope) => ctx.ids?.scrubberCursor ?? `${ctx.id}:scrubber-cursor`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `${ctx.id}:label`

// Element lookups — use querySelector with merged data attributes
export const getInputEl = (ctx: Scope) => ctx.query<HTMLInputElement>(ctx.selector(parts.input))
export const getIncrementTriggerEl = (ctx: Scope) => ctx.query<HTMLButtonElement>(ctx.selector(parts.incrementTrigger))
export const getDecrementTriggerEl = (ctx: Scope) => ctx.query<HTMLButtonElement>(ctx.selector(parts.decrementTrigger))
export const getScrubberEl = (ctx: Scope) => ctx.query(ctx.selector(parts.scrubber))
export const getScrubberCursorEl = (ctx: Scope) => ctx.query(ctx.selector(parts.scrubberCursor))

export const getPressedTriggerEl = (ctx: Scope, hint: HintValue | null) => {
  let btnEl: HTMLButtonElement | null = null
  if (hint === "increment") {
    btnEl = getIncrementTriggerEl(ctx)
  }
  if (hint === "decrement") {
    btnEl = getDecrementTriggerEl(ctx)
  }
  return btnEl
}

export const preventTextSelection = (ctx: Scope, direction: "horizontal" | "vertical") => {
  const doc = ctx.getDoc()
  const html = doc.documentElement
  const body = doc.body

  body.style.pointerEvents = "none"
  html.style.userSelect = "none"
  html.style.cursor = direction === "vertical" ? "ns-resize" : "ew-resize"

  return () => {
    body.style.pointerEvents = ""
    html.style.userSelect = ""
    html.style.cursor = ""
    if (!html.style.length) {
      html.removeAttribute("style")
    }
    if (!body.style.length) {
      body.removeAttribute("style")
    }
  }
}

interface MousemoveOpts {
  point: Point | null
  isRtl: boolean
  event: MouseEvent
  direction: "horizontal" | "vertical"
  teleportDistance?: number | undefined
}

export const getMousemoveValue = (ctx: Scope, opts: MousemoveOpts) => {
  const { point, isRtl, event, direction, teleportDistance } = opts

  const win = ctx.getWin()
  const x = roundToDpr(event.movementX, win.devicePixelRatio)
  const y = roundToDpr(event.movementY, win.devicePixelRatio)

  const isVertical = direction === "vertical"
  const delta = isVertical ? y : x

  // For vertical: up (negative y) = increment, down (positive y) = decrement
  // For horizontal: right (positive x) = increment, left (negative x) = decrement
  let hint: string | null
  if (isVertical) {
    hint = delta < 0 ? "increment" : delta > 0 ? "decrement" : null
  } else {
    hint = delta > 0 ? "increment" : delta < 0 ? "decrement" : null
  }

  if (!isVertical && isRtl) {
    if (hint === "increment") hint = "decrement"
    else if (hint === "decrement") hint = "increment"
  }

  const newPoint = { x: point!.x + x, y: point!.y + y }
  const half = roundToDpr(7.5, win.devicePixelRatio)

  if (teleportDistance != null) {
    // Wrap within teleport distance centered on the scrubber element
    const scrubberEl = getScrubberEl(ctx)
    if (scrubberEl) {
      const rect = scrubberEl.getBoundingClientRect()
      if (isVertical) {
        const center = rect.top + rect.height / 2
        const min = center - teleportDistance / 2
        const max = center + teleportDistance / 2
        newPoint.y = wrap(newPoint.y + half - min, max - min) + min - half
      } else {
        const center = rect.left + rect.width / 2
        const min = center - teleportDistance / 2
        const max = center + teleportDistance / 2
        newPoint.x = wrap(newPoint.x + half - min, max - min) + min - half
      }
    }
  } else {
    // Default: wrap at viewport bounds
    if (isVertical) {
      const height = win.innerHeight
      newPoint.y = wrap(newPoint.y + half, height) - half
    } else {
      const width = win.innerWidth
      newPoint.x = wrap(newPoint.x + half, width) - half
    }
  }

  return { hint, point: newPoint, delta }
}
