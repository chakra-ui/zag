import type { Scope } from "@zag-js/core"
import { isSafari, MAX_Z_INDEX } from "@zag-js/dom-query"
import type { Point } from "@zag-js/types"
import { roundToDpr, wrap } from "@zag-js/utils"
import type { HintValue } from "./number-input.types"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `number-input:${ctx.id}`
export const getInputId = (ctx: Scope) => ctx.ids?.input ?? `number-input:${ctx.id}:input`
export const getIncrementTriggerId = (ctx: Scope) => ctx.ids?.incrementTrigger ?? `number-input:${ctx.id}:inc`
export const getDecrementTriggerId = (ctx: Scope) => ctx.ids?.decrementTrigger ?? `number-input:${ctx.id}:dec`
export const getScrubberId = (ctx: Scope) => ctx.ids?.scrubber ?? `number-input:${ctx.id}:scrubber`
export const getCursorId = (ctx: Scope) => `number-input:${ctx.id}:cursor`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `number-input:${ctx.id}:label`

export const getInputEl = (ctx: Scope) => ctx.getById<HTMLInputElement>(getInputId(ctx))
export const getIncrementTriggerEl = (ctx: Scope) => ctx.getById<HTMLButtonElement>(getIncrementTriggerId(ctx))
export const getDecrementTriggerEl = (ctx: Scope) => ctx.getById<HTMLButtonElement>(getDecrementTriggerId(ctx))
export const getScrubberEl = (ctx: Scope) => ctx.getById(getScrubberId(ctx))
export const getCursorEl = (ctx: Scope) => ctx.getDoc().getElementById(getCursorId(ctx))

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

export const setupVirtualCursor = (ctx: Scope, point: Point | null) => {
  if (isSafari()) return
  createVirtualCursor(ctx, point)
  return () => {
    getCursorEl(ctx)?.remove()
  }
}

export const preventTextSelection = (ctx: Scope) => {
  const doc = ctx.getDoc()
  const html = doc.documentElement
  const body = doc.body

  body.style.pointerEvents = "none"
  html.style.userSelect = "none"
  html.style.cursor = "ew-resize"

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

export const getMousemoveValue = (ctx: Scope, opts: { point: Point | null; isRtl: boolean; event: MouseEvent }) => {
  const { point, isRtl, event } = opts

  const win = ctx.getWin()
  const x = roundToDpr(event.movementX, win.devicePixelRatio)
  const y = roundToDpr(event.movementY, win.devicePixelRatio)

  let hint = x > 0 ? "increment" : x < 0 ? "decrement" : null

  if (isRtl && hint === "increment") hint = "decrement"
  if (isRtl && hint === "decrement") hint = "increment"

  const newPoint = { x: point!.x + x, y: point!.y + y }
  const width = win.innerWidth
  const half = roundToDpr(7.5, win.devicePixelRatio)
  newPoint.x = wrap(newPoint.x + half, width) - half

  return { hint, point: newPoint }
}

export const createVirtualCursor = (ctx: Scope, point: Point | null) => {
  const doc = ctx.getDoc()
  const el = doc.createElement("div")
  el.className = "scrubber--cursor"
  el.id = getCursorId(ctx)

  Object.assign(el.style, {
    width: "15px",
    height: "15px",
    position: "fixed",
    pointerEvents: "none",
    left: "0px",
    top: "0px",
    zIndex: MAX_Z_INDEX,
    transform: point ? `translate3d(${point.x}px, ${point.y}px, 0px)` : undefined,
    willChange: "transform",
  })

  el.innerHTML = `
      <svg width="46" height="15" style="left: -15.5px; position: absolute; top: 0; filter: drop-shadow(rgba(0, 0, 0, 0.4) 0px 1px 1.1px);">
        <g transform="translate(2 3)">
          <path fill-rule="evenodd" d="M 15 4.5L 15 2L 11.5 5.5L 15 9L 15 6.5L 31 6.5L 31 9L 34.5 5.5L 31 2L 31 4.5Z" style="stroke-width: 2px; stroke: white;"></path>
          <path fill-rule="evenodd" d="M 15 4.5L 15 2L 11.5 5.5L 15 9L 15 6.5L 31 6.5L 31 9L 34.5 5.5L 31 2L 31 4.5Z"></path>
        </g>
      </svg>`

  doc.body.appendChild(el)
}
