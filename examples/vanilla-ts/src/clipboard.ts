import * as clipboard from "@zag-js/clipboard"
import { Component } from "./component"
import { normalizeProps, spreadProps, VanillaMachine } from "./lib"

export class Clipboard extends Component<clipboard.Props, clipboard.Api> {
  initMachine(props: clipboard.Props) {
    return new VanillaMachine(clipboard.machine, {
      ...props,
    })
  }

  initApi() {
    return clipboard.connect(this.machine.service, normalizeProps)
  }

  render() {
    spreadProps(this.rootEl, this.api.getRootProps())

    const label = this.rootEl.querySelector<HTMLElement>(".clipboard-label")
    if (label) spreadProps(label, this.api.getLabelProps())

    const control = this.rootEl.querySelector<HTMLElement>(".clipboard-control")
    if (control) spreadProps(control, this.api.getControlProps())

    const input = this.rootEl.querySelector<HTMLInputElement>(".clipboard-input")
    if (input) {
      spreadProps(input, this.api.getInputProps())
    }

    const trigger = this.rootEl.querySelector<HTMLButtonElement>(".clipboard-trigger")
    if (trigger) {
      spreadProps(trigger, this.api.getTriggerProps())
      // Update button text based on copy state
      trigger.textContent = this.api.copied ? "Copied!" : "Copy"
    }

    const copiedIndicator = this.rootEl.querySelector<HTMLElement>(".clipboard-copied-indicator")
    if (copiedIndicator) {
      spreadProps(copiedIndicator, this.api.getIndicatorProps({ copied: true }))
    }

    const idleIndicator = this.rootEl.querySelector<HTMLElement>(".clipboard-idle-indicator")
    if (idleIndicator) {
      spreadProps(idleIndicator, this.api.getIndicatorProps({ copied: false }))
    }
  }
}
