import * as popover from "@zag-js/popover"
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla"
import { Component } from "./component"

export class Popover extends Component<popover.Props, popover.Api> {
  initMachine(props: popover.Props) {
    return new VanillaMachine(popover.machine, props)
  }

  initApi() {
    return popover.connect(this.machine.service, normalizeProps)
  }

  render = () => {
    const rootEl = this.rootEl
    const triggerEl = rootEl.querySelector<HTMLElement>(".popover-trigger")
    if (triggerEl) this.spreadProps(triggerEl, this.api.getTriggerProps())
    const contentEl = rootEl.querySelector<HTMLElement>(".popover-content")
    if (contentEl) this.spreadProps(contentEl, this.api.getContentProps())
    const positionerEl = rootEl.querySelector<HTMLElement>(".popover-positioner")
    if (positionerEl) this.spreadProps(positionerEl, this.api.getPositionerProps())
  }
}
