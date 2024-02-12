import { getDocument } from "./env"

export interface ScopeContext {
  getRootNode?(): Document | ShadowRoot | Node
}

export function createScope<T>(methods: T) {
  const screen = {
    getRootNode: (ctx: ScopeContext) => (ctx.getRootNode?.() ?? document) as Document | ShadowRoot,
    getDoc: (ctx: ScopeContext) => getDocument(screen.getRootNode(ctx)),
    getWin: (ctx: ScopeContext) => screen.getDoc(ctx).defaultView ?? window,
    getActiveElement: (ctx: ScopeContext) => screen.getDoc(ctx).activeElement as HTMLElement | null,
    isActiveElement: (ctx: ScopeContext, elem: HTMLElement | null) => elem === screen.getActiveElement(ctx),
    getById: <T extends HTMLElement = HTMLElement>(ctx: ScopeContext, id: string) =>
      screen.getRootNode(ctx).getElementById(id) as T | null,
    setValue: <T extends { value: string }>(elem: T | null, value: string | number | null | undefined) => {
      if (elem == null || value == null) return
      const valueAsString = value.toString()
      if (elem.value === valueAsString) return
      elem.value = value.toString()
    },
  }

  return { ...screen, ...methods }
}
