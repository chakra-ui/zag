import { setElementValue } from "./form"
import { getActiveElement, getDocument } from "./node"
import type { HTMLElementWithValue } from "./types"

export interface ScopeContext {
  getRootNode?: (() => Document | ShadowRoot | Node) | undefined
}

export function createScope<T>(methods: T) {
  const dom = {
    getRootNode: (ctx: ScopeContext) => (ctx.getRootNode?.() ?? document) as Document | ShadowRoot,
    getDoc: (ctx: ScopeContext) => getDocument(dom.getRootNode(ctx)),
    getWin: (ctx: ScopeContext) => dom.getDoc(ctx).defaultView ?? window,
    getActiveElement: (ctx: ScopeContext) => getActiveElement(dom.getRootNode(ctx)),
    isActiveElement: (ctx: ScopeContext, elem: HTMLElement | null) => elem === dom.getActiveElement(ctx),
    getById: <T extends Element = HTMLElement>(ctx: ScopeContext, id: string) =>
      dom.getRootNode(ctx).getElementById(id) as T | null,
    setValue: <T extends HTMLElementWithValue>(elem: T | null, value: string | number | null | undefined) => {
      if (elem == null || value == null) return
      setElementValue(elem, value.toString())
    },
  }

  return { ...dom, ...methods }
}
