import * as toggleGroup from "@zag-js/toggle-group"
import { Component } from "./component"
import { normalizeProps, spreadProps, VanillaMachine } from "@zag-js/vanilla"

export class ToggleGroup extends Component<toggleGroup.Props, toggleGroup.Api> {
  initMachine(props: toggleGroup.Props) {
    return new VanillaMachine(toggleGroup.machine, {
      ...props,
    })
  }

  initApi() {
    return toggleGroup.connect(this.machine.service, normalizeProps)
  }

  render() {
    const rootProps = this.api.getRootProps()

    spreadProps(this.rootEl, rootProps)

    const items = this.rootEl.querySelectorAll<HTMLElement>(".toggle-group-item")
    items.forEach((item) => {
      const value = item.dataset.value
      if (value) {
        spreadProps(item, this.api.getItemProps({ value }))
      }
    })
  }
}
