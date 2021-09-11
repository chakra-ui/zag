import { NodeList } from "@core-dom/node-list"
import { ComboboxMachineContext } from "./combobox.machine"

export function getIds(uid: string) {
  return {
    label: `combobox-${uid}-label`,
    container: `combobox-${uid}`,
    input: `combobox-${uid}-input`,
    listbox: `combobox-${uid}-listbox`,
    toggleBtn: `combobox-${uid}-toggle-btn`,
    clearBtn: `combobox-${uid}-clear-btn`,
    srHint: `combobox-${uid}-sr-hint`,
    getOptionId: (index: number | string) => `combobox-${uid}-option-${index}`,
  }
}

export function getElements(ctx: ComboboxMachineContext) {
  const doc = ctx.doc ?? document
  const ids = getIds(ctx.uid)

  return {
    doc,
    activeOption: ctx.activeId ? doc?.getElementById(ctx.activeId) : null,
    label: doc.getElementById(ids.label),
    container: doc.getElementById(ids.container),
    input: doc.getElementById(ids.input) as HTMLInputElement,
    listbox: doc.getElementById(ids.listbox),
    toggleBtn: doc.getElementById(ids.toggleBtn),
    clearBtn: doc.getElementById(ids.clearBtn),
  }
}

export function dom(ctx: ComboboxMachineContext) {
  const { listbox, input, doc } = getElements(ctx)

  const selector = `[role=option]:not([disabled])`
  const nodelist = NodeList.fromSelector(listbox, selector)

  const focusedSelector = `[role=option][id=${ctx.activeId}]`
  const focusedOption = listbox?.querySelector<HTMLElement>(focusedSelector)

  return {
    first: nodelist.first,
    last: nodelist.last,
    prev: nodelist.prevById,
    next: nodelist.nextById,
    isFocused: doc.activeElement === input,
    focusedOption,
  }
}

export function attrs(el: HTMLElement | null | undefined) {
  return {
    value: el?.getAttribute("data-value") ?? "",
    label: el?.getAttribute("data-label") ?? "",
  }
}
