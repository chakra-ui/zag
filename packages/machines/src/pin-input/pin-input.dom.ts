import { createDOMCollection } from "@ui-machines/utils"
import { PinInputMachineContext } from "./pin-input.machine"

export function getElementIds(uid: string) {
  return {
    root: `pin-input-${uid}`,
    getInputId: (id: string) => `pin-input-${uid}-${id}`,
  }
}

export function dom(ctx: PinInputMachineContext) {
  const doc = ctx.doc ?? document
  const ids = getElementIds(ctx.uid)
  const selector = `input[data-ownedby=${ids.root}]`
  return createDOMCollection<HTMLInputElement>(doc, selector)
}
