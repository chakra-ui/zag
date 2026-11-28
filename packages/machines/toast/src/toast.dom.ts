import type { Scope } from "@zag-js/core"
import { AnimationFrame, queryAll } from "@zag-js/dom-query"
import { createSharedMutationObserver, resizeObserverBorderBox } from "@zag-js/dom-query/observe"
import type { Placement } from "./toast.types"
import { parts } from "./toast.anatomy"

const contentObserver = /* @__PURE__ */ createSharedMutationObserver({
  childList: true,
  subtree: true,
  characterData: true,
})

// ID generators — kept for ARIA attributes in connect
export const getRegionId = (placement: Placement) => `toast-group-${placement}`
export const getRootId = (ctx: Scope) => `${ctx.id}`
export const getTitleId = (ctx: Scope) => `${ctx.id}:title`
export const getDescriptionId = (ctx: Scope) => `${ctx.id}:description`
export const getCloseTriggerId = (ctx: Scope) => `${ctx.id}:close`

// Element lookups — use querySelector with merged data attributes
export const getRegionEl = (ctx: Scope, placement: Placement) => ctx.getById(`toast-group-${placement}`)
export const getToastEls = (ctx: Scope, placement: Placement) =>
  queryAll(getRegionEl(ctx, placement), `[${parts.root.attr}]`)
export const getRootEl = (ctx: Scope) => ctx.query(ctx.selector(parts.root))
export const getContentEl = (ctx: Scope) => ctx.query(ctx.selector(parts.content))
export const getTitleEl = (ctx: Scope) => ctx.query(ctx.selector(parts.title))
export const getDescriptionEl = (ctx: Scope) => ctx.query(ctx.selector(parts.description))

interface ObserveContentOptions {
  /** Called when the content's size may have changed */
  onChange: VoidFunction
  /** Called when the content's DOM changes */
  onMutate?: VoidFunction | undefined
}

// The root's height is set by CSS, so watch the content part, which sizes freely
export function observeContent(contentEl: HTMLElement, options: ObserveContentOptions) {
  const { onChange, onMutate } = options

  const frame = AnimationFrame.create()

  const stopResizeObserver = resizeObserverBorderBox.observe(contentEl, () => frame.request(onChange))

  // Content changes run before paint, so report them right away; resizes are deferred to avoid loops
  const stopMutationObserver = contentObserver.observe(contentEl, () => {
    frame.cancel()
    onChange()
    onMutate?.()
  })

  return () => {
    stopMutationObserver()
    stopResizeObserver()
    frame.cancel()
  }
}
