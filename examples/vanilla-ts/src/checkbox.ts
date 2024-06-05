import * as checkbox from "@zag-js/checkbox"
import { normalizeProps } from "./normalize-props"
import { spreadProps } from "./spread-props"
import { Component } from "./component"

export class Checkbox extends Component<checkbox.Context, checkbox.Api> {
  initService(context: checkbox.Context) {
    return checkbox.machine(context)
  }

  initApi() {
    return checkbox.connect(this.service.state, this.service.send, normalizeProps)
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
