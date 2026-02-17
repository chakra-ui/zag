import * as menu from "@zag-js/menu"
import { Component } from "./component"
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla"

export class Menu extends Component<menu.Props, menu.Api> {
  initMachine(props: menu.Props) {
    return new VanillaMachine(menu.machine, {
      ...props,
    })
  }

  initApi() {
    return menu.connect(this.machine.service, normalizeProps)
  }

  render() {
    const trigger = this.rootEl.querySelector<HTMLElement>(".menu-trigger")
    if (trigger) this.spreadProps(trigger, this.api.getTriggerProps())

    const positioner = this.rootEl.querySelector<HTMLElement>(".menu-positioner")
    const content = this.rootEl.querySelector<HTMLElement>(".menu-content")

    if (positioner && content) {
      if (this.api.open) {
        positioner.hidden = false
        this.spreadProps(positioner, this.api.getPositionerProps())
        this.spreadProps(content, this.api.getContentProps())

        const items = content.querySelectorAll<HTMLElement>(".menu-item")
        items.forEach((item) => {
          const value = item.dataset.value
          if (value) {
            this.spreadProps(item, this.api.getItemProps({ value }))
          }
        })
      } else {
        positioner.hidden = true
      }
    }
  }
}
