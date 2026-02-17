import * as checkbox from "@zag-js/checkbox"
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla"
import { Component } from "./component"

export class Checkbox extends Component<checkbox.Props, checkbox.Api> {
  initMachine(props: checkbox.Props) {
    return new VanillaMachine(checkbox.machine, props)
  }

  initApi() {
    return checkbox.connect(this.machine.service, normalizeProps)
  }

  render = () => {
    const rootEl = this.rootEl
    this.spreadProps(this.rootEl, this.api.getRootProps())
    const controlEl = rootEl.querySelector<HTMLElement>(".checkbox-control")
    if (controlEl) this.spreadProps(controlEl, this.api.getControlProps())
    const labelEl = rootEl.querySelector<HTMLElement>(".checkbox-label")
    if (labelEl) this.spreadProps(labelEl, this.api.getLabelProps())
    const inputEl = rootEl.querySelector<HTMLInputElement>(".checkbox-input")
    if (inputEl) this.spreadProps(inputEl, this.api.getHiddenInputProps())
  }
}
