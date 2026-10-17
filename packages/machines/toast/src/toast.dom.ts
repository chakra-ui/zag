import type { Scope } from "@zag-js/core"
import { AnimationFrame, getWindow, queryAll, resizeObserverBorderBox } from "@zag-js/dom-query"
import { callAll } from "@zag-js/utils"
import type { Placement } from "./toast.types"

export const getRegionId = (placement: Placement) => `toast-group:${placement}`
export const getRegionEl = (ctx: Scope, placement: Placement) => ctx.getById(`toast-group:${placement}`)
export const getToastEls = (ctx: Scope, placement: Placement) =>
  queryAll(getRegionEl(ctx, placement), "[data-scope=toast][data-part=root]")
export const getRootId = (ctx: Scope) => `toast:${ctx.id}`
export const getRootEl = (ctx: Scope) => ctx.getById(getRootId(ctx))
export const getTitleId = (ctx: Scope) => `toast:${ctx.id}:title`
export const getDescriptionId = (ctx: Scope) => `toast:${ctx.id}:description`
export const getTitleEl = (ctx: Scope) => ctx.getById(getTitleId(ctx))
export const getDescriptionEl = (ctx: Scope) => ctx.getById(getDescriptionId(ctx))
export const getCloseTriggerId = (ctx: Scope) => `toast${ctx.id}:close`

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
