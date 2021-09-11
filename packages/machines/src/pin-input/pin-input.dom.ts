import { NodeList } from "@core-dom/node-list"
import { PinInputMachineContext } from "./pin-input.machine"

export function getIds(uid: string) {
  return {
    root: `pin-input-${uid}`,
    getInputId: (id: string | number) => `pin-input-${uid}-${id}`,
  }
}

export function dom(ctx: PinInputMachineContext) {
  const doc = ctx.doc ?? document
  const ids = getIds(ctx.uid)
  const selector = `input[data-ownedby=${ids.root}]`
  return NodeList.fromSelector<HTMLInputElement>(doc, selector)
}
