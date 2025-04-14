import * as checkbox from "@zag-js/checkbox"
import { normalizeProps, spreadProps, VanillaMachine } from "./lib"
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
    spreadProps(this.rootEl, this.api.getRootProps())
    const controlEl = rootEl.querySelector<HTMLElement>(".checkbox-control")
    if (controlEl) spreadProps(controlEl, this.api.getControlProps())
    const labelEl = rootEl.querySelector<HTMLElement>(".checkbox-label")
    if (labelEl) spreadProps(labelEl, this.api.getLabelProps())
    const inputEl = rootEl.querySelector<HTMLInputElement>(".checkbox-input")
    if (inputEl) spreadProps(inputEl, this.api.getHiddenInputProps())
  }
}
