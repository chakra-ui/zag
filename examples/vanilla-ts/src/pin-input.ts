import * as pinInput from "@zag-js/pin-input"
import { Component } from "./component"
import { normalizeProps, spreadProps, VanillaMachine } from "./lib"

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
    spreadProps(this.rootEl, this.api.getRootProps())

    const label = this.rootEl.querySelector<HTMLElement>(".pin-input-label")
    if (label) spreadProps(label, this.api.getLabelProps())

    const inputs = this.rootEl.querySelectorAll<HTMLInputElement>(".pin-input-field")
    inputs.forEach((input, index) => {
      spreadProps(input, this.api.getInputProps({ index }))
    })

    const hiddenInput = this.rootEl.querySelector<HTMLInputElement>(".pin-input-hidden")
    if (hiddenInput) spreadProps(hiddenInput, this.api.getHiddenInputProps())

    const control = this.rootEl.querySelector<HTMLElement>(".pin-input-control")
    if (control) spreadProps(control, this.api.getControlProps())
  }
}
