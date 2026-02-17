import * as pinInput from "@zag-js/pin-input"
import { Component } from "./component"
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla"

export class PinInput extends Component<pinInput.Props, pinInput.Api> {
  initMachine(props: pinInput.Props) {
    return new VanillaMachine(pinInput.machine, {
      ...props,
    })
  }

  initApi() {
    return pinInput.connect(this.machine.service, normalizeProps)
  }

  render() {
    this.spreadProps(this.rootEl, this.api.getRootProps())

    const label = this.rootEl.querySelector<HTMLElement>(".pin-input-label")
    if (label) this.spreadProps(label, this.api.getLabelProps())

    const inputs = this.rootEl.querySelectorAll<HTMLInputElement>(".pin-input-field")
    inputs.forEach((input, index) => {
      this.spreadProps(input, this.api.getInputProps({ index }))
    })

    const hiddenInput = this.rootEl.querySelector<HTMLInputElement>(".pin-input-hidden")
    if (hiddenInput) this.spreadProps(hiddenInput, this.api.getHiddenInputProps())

    const control = this.rootEl.querySelector<HTMLElement>(".pin-input-control")
    if (control) this.spreadProps(control, this.api.getControlProps())
  }
}
