import { DOMNodeList } from "@core-dom/node-list"
import { TagsInputMachineContext } from "./tags-input.machine"

export function getElementIds(uid: string) {
  return {
    root: `tags-input-${uid}-root`,
    input: `tags-input-${uid}-input`,
    getTagId: (id: string | number) => `tags-input-${uid}-tag-${id}`,
  }
}

export function getElements(ctx: TagsInputMachineContext) {
  const doc = ctx.doc ?? document
  const ids = getElementIds(ctx.uid)
  return {
    root: doc.getElementById(ids.root),
    input: doc.getElementById(ids.input) as HTMLInputElement,
    getTag: (id: string) => doc.getElementById(ids.getTagId(id)),
    getEl: (id: string) => doc.getElementById(id),
  }
}

export function dom(ctx: TagsInputMachineContext) {
  const ids = getElementIds(ctx.uid)
  const { root, input } = getElements(ctx)
  const selector = `[data-ownedby=${ids.root}]`
  const collection = DOMNodeList.fromSelector(root, selector)

  return {
    isInputFocused: input.ownerDocument.activeElement === input,
    first: collection.first,
    last: collection.last,
    indexOfId: collection.indexOfId,
    prev: collection.prevById,
    next: collection.nextById,
  }
}
