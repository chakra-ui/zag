import { getActiveElement, getDocument } from "@zag-js/dom-query"
import type { Scope } from "./types"

export function createScope(props: Pick<Scope, "id" | "ids" | "getRootNode">) {
  const getRootNode = () => (props.getRootNode?.() ?? document) as Document | ShadowRoot
  const getDoc = () => getDocument(getRootNode())
  const getWin = () => getDoc().defaultView ?? window
  const getActiveElementFn = () => getActiveElement(getRootNode())
  // Should this use isActiveElement from packages/utilities/dom-query/src/node.ts?
  const isActiveElement = (elem: HTMLElement | null) => elem === getActiveElementFn()
  const getById = <T extends Element = HTMLElement>(id: string) => getRootNode().getElementById(id) as T | null
  return {
    ...props,
    getRootNode,
    getDoc,
    getWin,
    getActiveElement: getActiveElementFn,
    isActiveElement,
    getById,
  }
}
