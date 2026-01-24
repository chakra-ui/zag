import * as numberInput from "@zag-js/number-input"
import { Component } from "./component"
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla"

export class NumberInput extends Component<numberInput.Props, numberInput.Api> {
  initMachine(props: numberInput.Props) {
    return new VanillaMachine(numberInput.machine, {
      ...props,
    })
  }

  initApi() {
    return numberInput.connect(this.machine.service, normalizeProps)
  }

  render() {
    this.spreadProps(this.rootEl, this.api.getRootProps())

    const label = this.rootEl.querySelector<HTMLElement>(".number-input-label")
    if (label) this.spreadProps(label, this.api.getLabelProps())

    const input = this.rootEl.querySelector<HTMLInputElement>(".number-input-input")
    if (input) this.spreadProps(input, this.api.getInputProps())

    const incrementBtn = this.rootEl.querySelector<HTMLElement>(".number-input-increment")
    if (incrementBtn) this.spreadProps(incrementBtn, this.api.getIncrementTriggerProps())

    const decrementBtn = this.rootEl.querySelector<HTMLElement>(".number-input-decrement")
    if (decrementBtn) this.spreadProps(decrementBtn, this.api.getDecrementTriggerProps())

    const scrubber = this.rootEl.querySelector<HTMLElement>(".number-input-scrubber")
    if (scrubber) this.spreadProps(scrubber, this.api.getScrubberProps())
  }
}
