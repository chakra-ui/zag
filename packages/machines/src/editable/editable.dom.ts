import { EditableMachineContext } from "./editable.machine"

export function getElementIds(uid: string) {
  return {
    label: `editable-${uid}-label`,
    input: `editable-${uid}-input`,
    submitBtn: `editable-${uid}-submit-btn`,
    cancelBtn: `editable-${uid}-cancel-btn`,
    editBtn: `editable-${uid}-edit-btn`,
  }
}

export function getElements(ctx: EditableMachineContext) {
  const doc = ctx.doc ?? document
  const ids = getElementIds(ctx.uid ?? "")

  return {
    label: doc.getElementById(ids.label),
    input: doc.getElementById(ids.input) as HTMLInputElement | null,
    submitBtn: doc.getElementById(ids.submitBtn) as HTMLButtonElement | null,
    cancelBtn: doc.getElementById(ids.cancelBtn) as HTMLButtonElement | null,
    editBtn: doc.getElementById(ids.editBtn) as HTMLButtonElement | null,
  }
}
