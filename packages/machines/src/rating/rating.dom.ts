import { RatingMachineContext } from "./rating.machine"

export function getElementIds(uid: string) {
  return {
    inputId: `rating-${uid}-input`,
    getRatingId(id: string | number) {
      return `rating-${uid}--star-${id}`
    },
    rootId: `rating-${uid}`,
  }
}

export function getElements(ctx: RatingMachineContext) {
  const doc = ctx?.doc ?? document

  const { rootId } = getElementIds(ctx.uid)
  const rootNode = doc.getElementById(rootId)

  const selector = `[role=radio][aria-posinset='${Math.ceil(ctx.value)}']`
  const radio = rootNode?.querySelector(selector) as HTMLElement | null

  return {
    radio,
    radioGroup: rootNode,
  }
}
