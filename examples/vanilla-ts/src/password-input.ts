import * as passwordInput from "@zag-js/password-input"
import { Component } from "./component"
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla"

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
    this.spreadProps(this.rootEl, this.api.getRootProps())

    const label = this.rootEl.querySelector<HTMLElement>(".password-input-label")
    if (label) this.spreadProps(label, this.api.getLabelProps())

    const control = this.rootEl.querySelector<HTMLElement>(".password-input-control")
    if (control) this.spreadProps(control, this.api.getControlProps())

    const input = this.rootEl.querySelector<HTMLInputElement>(".password-input-input")
    if (input) this.spreadProps(input, this.api.getInputProps())

    const visibilityBtn = this.rootEl.querySelector<HTMLElement>(".password-input-visibility")
    if (visibilityBtn) {
      this.spreadProps(visibilityBtn, this.api.getVisibilityTriggerProps())

      const indicator = visibilityBtn.querySelector<HTMLElement>(".password-input-indicator")
      if (indicator) {
        this.spreadProps(indicator, this.api.getIndicatorProps())
        indicator.textContent = this.api.visible ? "Hide" : "Show"
      }
    }
  }
}
