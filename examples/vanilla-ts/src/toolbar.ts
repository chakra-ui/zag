import * as toolbar from "@zag-js/toolbar"
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla"
import { Component } from "./component"

export class Toolbar extends Component<toolbar.Props, toolbar.Api> {
  initMachine(props: toolbar.Props) {
    return new VanillaMachine(toolbar.machine, {
      ...props,
    })
  }

  initApi() {
    return toolbar.connect(this.machine.service, normalizeProps)
  }

  render() {
    this.spreadProps(this.rootEl, this.api.getRootProps())

    const group = this.rootEl.querySelector<HTMLElement>(".toolbar-group")
    if (group) this.spreadProps(group, this.api.getGroupProps({ value: "clipboard" }))

    const items = this.rootEl.querySelectorAll<HTMLElement>(".toolbar-item")
    items.forEach((item) => {
      const value = item.dataset.value
      if (value) this.spreadProps(item, this.api.getItemProps({ value }))
    })

    const separators = this.rootEl.querySelectorAll<HTMLElement>(".toolbar-separator")
    separators.forEach((separator) => this.spreadProps(separator, this.api.getSeparatorProps()))

    const link = this.rootEl.querySelector<HTMLElement>(".toolbar-link")
    if (link) this.spreadProps(link, this.api.getLinkProps({ value: "edited" }))
  }
}
