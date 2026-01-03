import * as switchMachine from "@zag-js/switch"
import { Component } from "./component"
import { normalizeProps, spreadProps, VanillaMachine } from "@zag-js/vanilla"

export class Switch extends Component<switchMachine.Props, switchMachine.Api> {
  initMachine(props: switchMachine.Props) {
    return new VanillaMachine(switchMachine.machine, {
      ...props,
    })
  }

  initApi() {
    return switchMachine.connect(this.machine.service, normalizeProps)
  }

  render() {
    spreadProps(this.rootEl, this.api.getRootProps())

    const label = this.rootEl.querySelector<HTMLElement>(".switch-label")
    if (label) spreadProps(label, this.api.getLabelProps())

    const control = this.rootEl.querySelector<HTMLElement>(".switch-control")
    if (control) spreadProps(control, this.api.getControlProps())

    const thumb = this.rootEl.querySelector<HTMLElement>(".switch-thumb")
    if (thumb) spreadProps(thumb, this.api.getThumbProps())

    const input = this.rootEl.querySelector<HTMLInputElement>(".switch-input")
    if (input) spreadProps(input, this.api.getHiddenInputProps())
  }
}
