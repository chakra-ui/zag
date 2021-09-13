import { RatingMachineContext } from "./rating.machine"

export function getIds(uid: string) {
  return {
    label: `rating-label-${uid}`,
    input: `rating-input-${uid}`,
    getRatingId: (id: string | number) => `rating-star-${uid}-${id}`,
    root: `rating-${uid}`,
  }
}

export function getElements(ctx: RatingMachineContext) {
  const doc = ctx?.doc ?? document

  const ids = getIds(ctx.uid)
  const root = doc.getElementById(ids.root)

  const selector = `[role=radio][aria-posinset='${Math.ceil(ctx.value)}']`
  const radio = root?.querySelector<HTMLElement>(selector)

  return {
    activeElement: doc.activeElement,
    radio,
    root,
    input: doc.getElementById(ids.input),
  }
}
