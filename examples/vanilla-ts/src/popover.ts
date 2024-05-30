import * as popover from "@zag-js/popover"
import { normalizeProps } from "./normalize-props"
import { spreadProps } from "./spread-props"
import { Component } from "./component"

export class Popover extends Component<popover.Context, popover.Api> {
  initService(context: popover.Context) {
    return popover.machine(context)
  }

  initApi() {
    return popover.connect(this.service.state, this.service.send, normalizeProps)
  }

  render = () => {
    const rootEl = this.rootEl
    const triggerEl = rootEl.querySelector<HTMLElement>(".popover-trigger")
    if (triggerEl) spreadProps(triggerEl, this.api.getTriggerProps())
    const contentEl = rootEl.querySelector<HTMLElement>(".popover-content")
    if (contentEl) spreadProps(contentEl, this.api.getContentProps())
    const positionerEl = rootEl.querySelector<HTMLElement>(".popover-positioner")
    if (positionerEl) spreadProps(positionerEl, this.api.getPositionerProps())
  }
}
