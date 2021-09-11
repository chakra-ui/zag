import { RatingMachineContext } from "./rating.machine"

export function getIds(uid: string) {
  return {
    inputId: `rating-${uid}-input`,
    getRatingId: (id: string | number) => `rating-${uid}--star-${id}`,
    rootId: `rating-${uid}`,
  }
}

export function getElements(ctx: RatingMachineContext) {
  const doc = ctx?.doc ?? document

  const { rootId } = getIds(ctx.uid)
  const rootNode = doc.getElementById(rootId)

  const selector = `[role=radio][aria-posinset='${Math.ceil(ctx.value)}']`
  const radio = rootNode?.querySelector<HTMLElement>(selector)

  return {
    radio,
    radioGroup: rootNode,
  }
}
