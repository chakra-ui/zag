import { NumberInputMachineContext } from "./number-input.machine"

export function getIds(uid: string | number) {
  return {
    inputId: `input-${uid}`,
    incButtonId: `inc-btn-${uid}`,
    decButtonId: `dec-btn-${uid}`,
  }
}

export function getElements(ctx: NumberInputMachineContext) {
  const doc = ctx.doc ?? document
  const { inputId, incButtonId, decButtonId } = getIds(ctx.uid)
  return {
    input: doc.getElementById(inputId),
    incButton: doc.getElementById(incButtonId),
    decButton: doc.getElementById(decButtonId),
  }
}
