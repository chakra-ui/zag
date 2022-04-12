import { MAX_Z_INDEX } from "@zag-js/dom-utils"
import { roundToPx, wrap } from "@zag-js/number-utils"
import { MachineContext as Ctx } from "./number-input.types"

type InputEl = HTMLInputElement | null
type ButtonEl = HTMLButtonElement | null

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,
  getWin: (ctx: Ctx) => dom.getDoc(ctx).defaultView ?? window,

  getInputId: (ctx: Ctx) => ctx.ids?.input ?? `number-input-${ctx.uid}-input`,
  getIncButtonId: (ctx: Ctx) => ctx.ids?.incBtn ?? `number-input-${ctx.uid}-inc-btn`,
  getDecButtonId: (ctx: Ctx) => ctx.ids?.decBtn ?? `number-input-${ctx.uid}-dec-btn`,
  getScrubberId: (ctx: Ctx) => ctx.ids?.scrubber ?? `number-input-${ctx.uid}-scrubber`,
  getCursorId: (ctx: Ctx) => `number-input-${ctx.uid}-cursor`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `number-input-${ctx.uid}-label`,
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `number-input-${ctx.uid}-root`,

  getInputEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getInputId(ctx)) as InputEl,
  getIncButtonEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getIncButtonId(ctx)) as ButtonEl,
  getDecButtonEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getDecButtonId(ctx)) as ButtonEl,
  getScrubberEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getScrubberId(ctx)),
  getCursorEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getCursorId(ctx)),

  getMousementValue(ctx: Ctx, event: MouseEvent) {
    const x = roundToPx(event.movementX)
    const y = roundToPx(event.movementY)

    let hint = x > 0 ? "increment" : x < 0 ? "decrement" : null

    if (ctx.isRtl && hint === "increment") hint = "decrement"
    if (ctx.isRtl && hint === "decrement") hint = "increment"

    const point = {
      x: ctx.scrubberCursorPoint!.x + x,
      y: ctx.scrubberCursorPoint!.y + y,
    }

    const win = dom.getWin(ctx)
    const width = win.innerWidth
    const half = roundToPx(7.5)
    point.x = wrap(point.x + half, width) - half

    return { hint, point }
  },

  createVirtualCursor(ctx: Ctx) {
    const doc = dom.getDoc(ctx)
    const el = doc.createElement("div")
    el.className = "scrubber--cursor"
    el.id = dom.getCursorId(ctx)

    Object.assign(el.style, {
      width: "15px",
      height: "15px",
      position: "fixed",
      pointerEvents: "none",
      left: "0px",
      top: "0px",
      zIndex: MAX_Z_INDEX,
      transform: ctx.scrubberCursorPoint
        ? `translate3d(${ctx.scrubberCursorPoint.x}px, ${ctx.scrubberCursorPoint.y}px, 0px)`
        : undefined,
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
  },
}
