import { getActiveElement, getDocument, isActiveElement } from "@zag-js/dom-query"
import type { Scope } from "./types"

export function createScope(props: Pick<Scope, "id" | "ids" | "getRootNode">) {
  const getRootNode = () => (props.getRootNode?.() ?? document) as Document | ShadowRoot
  const getDoc = () => getDocument(getRootNode())
  const getWin = () => getDoc().defaultView ?? window
  const getActiveElementFn = () => getActiveElement(getRootNode())
  const getById = <T extends Element = HTMLElement>(id: string) => getRootNode().getElementById(id) as T | null
  const queryFn = <T extends Element = HTMLElement>(selector: string) =>
    getRootNode().querySelector<T>(selector) ?? null
  const queryAllFn = <T extends Element = HTMLElement>(selector: string) =>
    Array.from(getRootNode().querySelectorAll<T>(selector))
  const selectorFn = (part: { attr: string }) => `[${part.attr}="${props.id}"]`
  return {
    ...props,
    getRootNode,
    getDoc,
    getWin,
    getActiveElement: getActiveElementFn,
    isActiveElement,
    getById,
    query: queryFn,
    queryAll: queryAllFn,
    selector: selectorFn,
  }
}
