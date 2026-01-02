import * as tooltip from "@zag-js/tooltip"
import { Component } from "./component"
import { normalizeProps, spreadProps, VanillaMachine } from "@zag-js/vanilla"

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

    if (trigger) spreadProps(trigger, triggerProps)
    if (positioner) spreadProps(positioner, positionerProps)
    if (content) spreadProps(content, contentProps)
  }
}
