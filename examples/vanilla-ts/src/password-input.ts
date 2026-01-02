import * as passwordInput from "@zag-js/password-input"
import { Component } from "./component"
import { normalizeProps, spreadProps, VanillaMachine } from "@zag-js/vanilla"

export class PasswordInput extends Component<passwordInput.Props, passwordInput.Api> {
  initMachine(props: passwordInput.Props) {
    return new VanillaMachine(passwordInput.machine, {
      ...props,
    })
  }

  initApi() {
    return passwordInput.connect(this.machine.service, normalizeProps)
  }

  render() {
    spreadProps(this.rootEl, this.api.getRootProps())

    const label = this.rootEl.querySelector<HTMLElement>(".password-input-label")
    if (label) spreadProps(label, this.api.getLabelProps())

    const control = this.rootEl.querySelector<HTMLElement>(".password-input-control")
    if (control) spreadProps(control, this.api.getControlProps())

    const input = this.rootEl.querySelector<HTMLInputElement>(".password-input-input")
    if (input) spreadProps(input, this.api.getInputProps())

    const visibilityBtn = this.rootEl.querySelector<HTMLElement>(".password-input-visibility")
    if (visibilityBtn) {
      spreadProps(visibilityBtn, this.api.getVisibilityTriggerProps())

      const indicator = visibilityBtn.querySelector<HTMLElement>(".password-input-indicator")
      if (indicator) {
        spreadProps(indicator, this.api.getIndicatorProps())
        indicator.textContent = this.api.visible ? "Hide" : "Show"
      }
    }
  }
}
