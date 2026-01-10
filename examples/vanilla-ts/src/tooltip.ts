import * as tooltip from "@zag-js/tooltip"
import { Component } from "./component"
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla"

export class Tooltip extends Component<tooltip.Props, tooltip.Api> {
  initMachine(props: tooltip.Props) {
    return new VanillaMachine(tooltip.machine, {
      ...props,
    })
  }

  initApi() {
    return tooltip.connect(this.machine.service, normalizeProps)
  }

  render() {
    const triggerProps = this.api.getTriggerProps()
    const positionerProps = this.api.getPositionerProps()
    const contentProps = this.api.getContentProps()

    const trigger = this.rootEl.querySelector<HTMLElement>(".tooltip-trigger")
    const positioner = this.rootEl.querySelector<HTMLElement>(".tooltip-positioner")
    const content = this.rootEl.querySelector<HTMLElement>(".tooltip-content")

    if (trigger) this.spreadProps(trigger, triggerProps)
    if (positioner) this.spreadProps(positioner, positionerProps)
    if (content) this.spreadProps(content, contentProps)
  }
}
