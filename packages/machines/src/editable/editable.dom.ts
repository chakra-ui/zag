import { EditableMachineContext } from "./editable.machine"

export function getIds(id: string) {
  return {
    label: `editable-label-${id}`,
    input: `editable-input-${id}`,
    submitBtn: `editable-submit-btn-${id}`,
    cancelBtn: `editable-cancel-btn-${id}`,
    editBtn: `editable-edit-btn-${id}`,
  }
}

export function getElements(ctx: EditableMachineContext) {
  const doc = ctx.doc ?? document
  const ids = getIds(ctx.uid)

  return {
    label: doc.getElementById(ids.label),
    input: doc.getElementById(ids.input) as HTMLInputElement | null,
    submitBtn: doc.getElementById(ids.submitBtn) as HTMLButtonElement | null,
    cancelBtn: doc.getElementById(ids.cancelBtn) as HTMLButtonElement | null,
    editBtn: doc.getElementById(ids.editBtn) as HTMLButtonElement | null,
  }
}
