import * as checkbox from "@zag-js/checkbox"
import { normalizeProps } from "./normalize-props"
import { spreadProps } from "./spread-props"
import { Component } from "./component"

export class Checkbox extends Component<checkbox.Context, checkbox.Api<any>> {
  initService(context: checkbox.Context) {
    this.service = checkbox.machine(context)
  }

  initApi(): checkbox.Api<any> {
    return checkbox.connect(this.service.state, this.service.send, normalizeProps)
  }

  render = () => {
    const rootEl = this.rootEl
    spreadProps(this.rootEl, this.api.rootProps)
    const controlEl = rootEl.querySelector<HTMLElement>(".checkbox-control")
    if (controlEl) spreadProps(controlEl, this.api.controlProps)
    const labelEl = rootEl.querySelector<HTMLElement>(".checkbox-label")
    if (labelEl) spreadProps(labelEl, this.api.labelProps)
    const inputEl = rootEl.querySelector<HTMLInputElement>(".checkbox-input")
    if (inputEl) spreadProps(inputEl, this.api.hiddenInputProps)
  }
}
