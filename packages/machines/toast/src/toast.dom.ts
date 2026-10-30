import type { Scope } from "@zag-js/core"
import { AnimationFrame, getWindow, queryAll, resizeObserverBorderBox } from "@zag-js/dom-query"
import { callAll } from "@zag-js/utils"
import type { Placement } from "./toast.types"
import { parts } from "./toast.anatomy"

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
export const getTitleEl = (ctx: Scope) => ctx.query(ctx.selector(parts.title))
export const getDescriptionEl = (ctx: Scope) => ctx.query(ctx.selector(parts.description))

interface ObserveContentOptions {
  filter?: ((el: Element) => boolean) | undefined
  /** Called when the content's size may have changed */
  onChange: VoidFunction
  /** Called when the content's DOM changes */
  onMutate?: VoidFunction | undefined
}

// The root's height is set by CSS, so watch its children, which size freely with the content
export function observeContent(rootEl: HTMLElement, options: ObserveContentOptions) {
  const { filter = () => true, onChange, onMutate } = options

  const win = getWindow(rootEl)
  const frame = AnimationFrame.create()

  const notify = () => frame.request(onChange)

  let stopObservingChildren: VoidFunction | undefined

  const observeChildren = () => {
    stopObservingChildren?.()

    const children = Array.from(rootEl.children).filter(filter)
    stopObservingChildren = callAll(...children.map((child) => resizeObserverBorderBox.observe(child, notify)))
  }

  observeChildren()

  // Content changes run before paint, so report them right away; resizes are deferred to avoid loops
  const mutationObserver = new win.MutationObserver(() => {
    frame.cancel()
    onChange()
    onMutate?.()
    observeChildren()
  })

  mutationObserver.observe(rootEl, { childList: true, subtree: true, characterData: true })

  return () => {
    mutationObserver.disconnect()
    stopObservingChildren?.()
    frame.cancel()
  }
}
