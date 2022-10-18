import { getDocument, getWindow } from "./get-element"

type BaseContext = {
  getRootNode?: () => Document | ShadowRoot | Node
}

type BaseDetails = {
  [event: string]: {
    [key: string]: any
  }
}

export interface CustomEventListener<EventMap extends BaseDetails> {
  <E extends keyof EventMap>(event: E, cb: (evt: CustomEvent<EventMap[E]>) => void): VoidFunction
}

export interface CustomEventEmitter<EventMap extends BaseDetails> {
  <E extends keyof EventMap>(evt: E, detail: EventMap[E], options?: EventInit): void
}

type Callable<T> = T | (() => T)

export function defineHelpers<T>(rest: T) {
  const dom = {
    getRootNode(ctx: BaseContext) {
      return (ctx.getRootNode?.() ?? document) as Document | ShadowRoot
    },
    getDoc(ctx: BaseContext) {
      return getDocument(dom.getRootNode(ctx))
    },
    getWin(ctx: BaseContext) {
      return getWindow(dom.getDoc(ctx))
    },
    getActiveElement(ctx: BaseContext) {
      return dom.getDoc(ctx).activeElement as HTMLElement | null
    },
    getById<T = HTMLElement>(ctx: BaseContext, id: string) {
      return dom.getRootNode(ctx).getElementById(id) as T | null
    },
    createEmitter<EventMap extends BaseDetails>(
      ctx: BaseContext,
      target: Callable<HTMLElement>,
    ): CustomEventEmitter<EventMap> {
      return function emit(evt, detail, options) {
        const { bubbles = true, cancelable, composed = true } = options ?? {}
        const eventName = `zag:${String(evt)}`

        const init: CustomEventInit = {
          bubbles,
          cancelable,
          composed,
          detail,
        }

        const win = dom.getWin(ctx)
        const event = new win.CustomEvent(eventName, init)
        const node = typeof target === "function" ? target() : target
        node.dispatchEvent(event)
      }
    },
    createListener<EventMap extends BaseDetails>(target: Callable<HTMLElement>): CustomEventListener<EventMap> {
      return function on(evt, listener) {
        const eventName = `zag:${String(evt)}`
        const node = typeof target === "function" ? target() : target
        node.addEventListener(eventName, listener as EventListener)
        return function off() {
          return node.removeEventListener(eventName, listener as EventListener)
        }
      }
    },
  }

  return { ...dom, ...rest }
}
