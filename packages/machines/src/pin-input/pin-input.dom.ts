import { DOMNodeList } from "@core-dom/node-list"
import { PinInputMachineContext } from "./pin-input.machine"

export function getElementIds(uid: string) {
  return {
    root: `pin-input-${uid}`,
    getInputId: (id: string | number) => `pin-input-${uid}-${id}`,
  }
}

export function dom(ctx: PinInputMachineContext) {
  const doc = ctx.doc ?? document
  const ids = getElementIds(ctx.uid)
  const selector = `input[data-ownedby=${ids.root}]`
  return DOMNodeList.fromSelector<HTMLInputElement>(doc, selector)
}
