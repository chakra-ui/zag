import { NodeList } from "@core-dom/node-list"
import { TagsInputMachineContext } from "./tags-input.machine"

export function getIds(uid: string) {
  return {
    root: `tags-input-${uid}-root`,
    input: `tags-input-${uid}-input`,
    getTagId: (id: string | number) => `tags-input-${uid}-tag-${id}`,
  }
}

export function getElements(ctx: TagsInputMachineContext) {
  const doc = ctx.doc ?? document
  const ids = getIds(ctx.uid)
  return {
    root: doc.getElementById(ids.root),
    input: doc.getElementById(ids.input) as HTMLInputElement,
    getTag: (id: string) => doc.getElementById(ids.getTagId(id)),
    getEl: (id: string) => doc.getElementById(id),
  }
}

export function dom(ctx: TagsInputMachineContext) {
  const ids = getIds(ctx.uid)
  const { root, input } = getElements(ctx)
  const selector = `[data-ownedby=${ids.root}]`
  const list = NodeList.fromSelector(root, selector)

  return {
    isInputFocused: input.ownerDocument.activeElement === input,
    first: list.first,
    last: list.last,
    indexOfId: list.indexOfId,
    prev: list.prevById,
    next: list.nextById,
  }
}
