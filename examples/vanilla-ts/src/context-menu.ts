import * as menu from "@zag-js/menu"
import { Component } from "./component"
import { normalizeProps, spreadProps, VanillaMachine } from "@zag-js/vanilla"

export class ContextMenu extends Component<menu.Props, menu.Api> {
  initMachine(props: menu.Props) {
    return new VanillaMachine(menu.machine, {
      ...props,
      onSelect: (details) => {
        console.log("Selected:", details.value)
      },
    })
  }

  initApi() {
    return menu.connect(this.machine.service, normalizeProps)
  }

  render() {
    const contextTrigger = this.rootEl.querySelector<HTMLElement>(".context-menu-trigger")
    if (contextTrigger) spreadProps(contextTrigger, this.api.getContextTriggerProps())

    const positioner = this.rootEl.querySelector<HTMLElement>(".context-menu-positioner")
    const content = this.rootEl.querySelector<HTMLElement>(".context-menu-content")

    if (positioner && content) {
      if (this.api.open) {
        positioner.hidden = false
        spreadProps(positioner, this.api.getPositionerProps())
        spreadProps(content, this.api.getContentProps())

        const items = content.querySelectorAll<HTMLElement>(".context-menu-item")
        items.forEach((item) => {
          const value = item.dataset.value
          if (value) {
            spreadProps(item, this.api.getItemProps({ value }))
          }
        })
      } else {
        positioner.hidden = true
      }
    }
  }
}
