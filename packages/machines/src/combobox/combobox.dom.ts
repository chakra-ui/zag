import { DOMNodeList } from "@core-dom/node-list"
import { ComboboxMachineContext } from "./combobox.machine"

export function getElementIds(uid: string) {
  return {
    label: `combobox-${uid}-label`,
    container: `combobox-${uid}`,
    input: `combobox-${uid}-input`,
    listbox: `combobox-${uid}-listbox`,
    toggleBtn: `combobox-${uid}-toggle-btn`,
    getOptionId: (index: number | string) => `combobox-${uid}-option-${index}`,
  }
}

export function getElements(ctx: ComboboxMachineContext) {
  const doc = ctx.doc ?? document
  const ids = getElementIds(ctx.uid)

  return {
    activeOption: ctx.activeId ? doc?.getElementById(ctx.activeId) : null,
    label: doc.getElementById(ids.label),
    container: doc.getElementById(ids.container),
    input: doc.getElementById(ids.input) as HTMLInputElement,
    listbox: doc.getElementById(ids.listbox),
    toggleBtn: doc.getElementById(ids.toggleBtn),
  }
}

export function dom(ctx: ComboboxMachineContext) {
  const { listbox } = getElements(ctx)
  const selector = `[role=option]:not([disabled])`
  const collection = DOMNodeList.fromSelector(listbox, selector)

  return {
    first: collection.first,
    last: collection.last,
    prev: collection.prevById,
    next: collection.nextById,
  }
}
