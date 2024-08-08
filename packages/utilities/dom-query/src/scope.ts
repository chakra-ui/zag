import { getDocument } from "./env"

export interface ScopeContext {
  getRootNode?(): Document | ShadowRoot | Node
}

export function createScope<T>(methods: T) {
  const dom = {
    getRootNode: (ctx: ScopeContext) => (ctx.getRootNode?.() ?? document) as Document | ShadowRoot,
    getDoc: (ctx: ScopeContext) => getDocument(dom.getRootNode(ctx)),
    getWin: (ctx: ScopeContext) => dom.getDoc(ctx).defaultView ?? window,
    getActiveElement: (ctx: ScopeContext) => dom.getRootNode(ctx).activeElement,
    isActiveElement: (ctx: ScopeContext, elem: HTMLElement | null) => elem === dom.getActiveElement(ctx),
    getById: <T extends Element = HTMLElement>(ctx: ScopeContext, id: string) =>
      dom.getRootNode(ctx).getElementById(id) as T | null,
    setValue: <T extends { value: string }>(elem: T | null, value: string | number | null | undefined) => {
      if (elem == null || value == null) return
      const valueAsString = value.toString()
      if (elem.value === valueAsString) return
      elem.value = value.toString()
    },
  }

  return { ...dom, ...methods }
}
