import * as hoverCard from "@zag-js/hover-card"
import { Component } from "./component"
import { normalizeProps, spreadProps, VanillaMachine } from "@zag-js/vanilla"

export class HoverCard extends Component<hoverCard.Props, hoverCard.Api> {
  initMachine(props: hoverCard.Props) {
    return new VanillaMachine(hoverCard.machine, {
      ...props,
    })
  }

  initApi() {
    return hoverCard.connect(this.machine.service, normalizeProps)
  }

  render() {
    const trigger = this.rootEl.querySelector<HTMLElement>(".hover-card-trigger")
    if (trigger) spreadProps(trigger, this.api.getTriggerProps())

    const positioner = this.rootEl.querySelector<HTMLElement>(".hover-card-positioner")
    const content = this.rootEl.querySelector<HTMLElement>(".hover-card-content")
    const arrow = this.rootEl.querySelector<HTMLElement>(".hover-card-arrow")
    const arrowTip = this.rootEl.querySelector<HTMLElement>(".hover-card-arrow-tip")

    if (positioner && content) {
      if (this.api.open) {
        positioner.hidden = false
        spreadProps(positioner, this.api.getPositionerProps())
        spreadProps(content, this.api.getContentProps())

        if (arrow) spreadProps(arrow, this.api.getArrowProps())
        if (arrowTip) spreadProps(arrowTip, this.api.getArrowTipProps())
      } else {
        positioner.hidden = true
      }
    }
  }
}
