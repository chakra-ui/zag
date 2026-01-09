import * as radio from "@zag-js/radio-group"
import { Component } from "./component"
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla"

export class RadioGroup extends Component<radio.Props, radio.Api> {
  initMachine(props: radio.Props) {
    return new VanillaMachine(radio.machine, {
      ...props,
    })
  }

  initApi() {
    return radio.connect(this.machine.service, normalizeProps)
  }

  render() {
    this.spreadProps(this.rootEl, this.api.getRootProps())

    const label = this.rootEl.querySelector<HTMLElement>(".radio-group-label")
    if (label) this.spreadProps(label, this.api.getLabelProps())

    const items = this.rootEl.querySelectorAll<HTMLElement>(".radio-item")
    items.forEach((item) => {
      const value = item.dataset.value
      if (value) {
        const itemProps = this.api.getItemProps({ value })
        this.spreadProps(item, itemProps)

        const control = item.querySelector<HTMLElement>(".radio-control")
        if (control) this.spreadProps(control, this.api.getItemControlProps({ value }))

        const label = item.querySelector<HTMLElement>(".radio-label")
        if (label) this.spreadProps(label, this.api.getItemTextProps({ value }))

        const input = item.querySelector<HTMLInputElement>(".radio-input")
        if (input) this.spreadProps(input, this.api.getItemHiddenInputProps({ value }))
      }
    })
  }
}
