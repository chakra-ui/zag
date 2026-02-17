import * as editable from "@zag-js/editable"
import { Component } from "./component"
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla"

export class Editable extends Component<editable.Props, editable.Api> {
  initMachine(props: editable.Props) {
    return new VanillaMachine(editable.machine, {
      defaultValue: "Hello World",
      ...props,
    })
  }

  initApi() {
    return editable.connect(this.machine.service, normalizeProps)
  }

  render() {
    this.spreadProps(this.rootEl, this.api.getRootProps())

    const area = this.rootEl.querySelector<HTMLElement>(".editable-area")
    if (area) this.spreadProps(area, this.api.getAreaProps())

    const input = this.rootEl.querySelector<HTMLInputElement>(".editable-input")
    if (input) this.spreadProps(input, this.api.getInputProps())

    const preview = this.rootEl.querySelector<HTMLElement>(".editable-preview")
    if (preview) {
      this.spreadProps(preview, this.api.getPreviewProps())
      preview.textContent = this.api.value
    }

    const control = this.rootEl.querySelector<HTMLElement>(".editable-control")
    if (control) this.spreadProps(control, this.api.getControlProps())

    const editBtn = this.rootEl.querySelector<HTMLElement>(".editable-edit")
    if (editBtn) {
      this.spreadProps(editBtn, this.api.getEditTriggerProps())
      editBtn.style.display = this.api.editing ? "none" : "inline-block"
    }

    const saveBtn = this.rootEl.querySelector<HTMLElement>(".editable-save")
    if (saveBtn) {
      this.spreadProps(saveBtn, this.api.getSubmitTriggerProps())
      saveBtn.style.display = this.api.editing ? "inline-block" : "none"
    }

    const cancelBtn = this.rootEl.querySelector<HTMLElement>(".editable-cancel")
    if (cancelBtn) {
      this.spreadProps(cancelBtn, this.api.getCancelTriggerProps())
      cancelBtn.style.display = this.api.editing ? "inline-block" : "none"
    }
  }
}
