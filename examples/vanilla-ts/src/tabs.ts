import * as tabs from "@zag-js/tabs"
import { Component } from "./component"
import { normalizeProps, spreadProps, VanillaMachine } from "@zag-js/vanilla"

export class Tabs extends Component<tabs.Props, tabs.Api> {
  initMachine(props: tabs.Props) {
    return new VanillaMachine(tabs.machine, {
      ...props,
    })
  }

  initApi() {
    return tabs.connect(this.machine.service, normalizeProps)
  }

  render() {
    const rootProps = this.api.getRootProps()
    const listProps = this.api.getListProps()
    const indicatorProps = this.api.getIndicatorProps()

    spreadProps(this.rootEl, rootProps)

    const tablist = this.rootEl.querySelector<HTMLElement>(".tabs-list")
    if (tablist) spreadProps(tablist, listProps)

    const indicator = this.rootEl.querySelector<HTMLElement>(".tabs-indicator")
    if (indicator) spreadProps(indicator, indicatorProps)

    const tabs = this.rootEl.querySelectorAll<HTMLElement>(".tabs-trigger")
    tabs.forEach((tab) => {
      const value = tab.dataset.value
      if (value) {
        spreadProps(tab, this.api.getTriggerProps({ value }))
      }
    })

    const panels = this.rootEl.querySelectorAll<HTMLElement>(".tabs-content")
    panels.forEach((panel) => {
      const value = panel.dataset.value
      if (value) {
        spreadProps(panel, this.api.getContentProps({ value }))
      }
    })
  }
}
