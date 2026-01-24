import * as steps from "@zag-js/steps"
import { Component } from "./component"
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla"

export class Steps extends Component<steps.Props, steps.Api> {
  initMachine(props: steps.Props) {
    return new VanillaMachine(steps.machine, {
      ...props,
    })
  }

  initApi() {
    return steps.connect(this.machine.service, normalizeProps)
  }

  syncSteps = () => {
    const list = this.rootEl.querySelector<HTMLElement>(".steps-list")
    if (!list) return

    const items = Array.from(list.querySelectorAll<HTMLElement>(".steps-item"))

    items.forEach((item, index) => {
      const itemState = this.api.getItemState({ index })
      this.spreadProps(item, this.api.getItemProps({ index }))

      // Update indicator
      const indicator = item.querySelector<HTMLElement>(".steps-indicator")
      if (indicator) {
        this.spreadProps(indicator, this.api.getIndicatorProps({ index }))
        indicator.textContent = String(index + 1)
      }

      // Update trigger
      const trigger = item.querySelector<HTMLElement>(".steps-trigger")
      if (trigger) {
        this.spreadProps(trigger, this.api.getTriggerProps({ index }))
      }

      // Update separator
      const separator = item.querySelector<HTMLElement>(".steps-separator")
      if (separator) {
        this.spreadProps(separator, this.api.getSeparatorProps({ index }))
      }

      // Update data attributes for styling
      item.setAttribute("data-current", String(itemState.current))
      item.setAttribute("data-completed", String(itemState.completed))
      item.setAttribute("data-incomplete", String(itemState.incomplete))
    })
  }

  syncContents = () => {
    const contents = Array.from(this.rootEl.querySelectorAll<HTMLElement>(".steps-content"))

    contents.forEach((content, index) => {
      this.spreadProps(content, this.api.getContentProps({ index }))
    })
  }

  render() {
    this.spreadProps(this.rootEl, this.api.getRootProps())

    const list = this.rootEl.querySelector<HTMLElement>(".steps-list")
    if (list) this.spreadProps(list, this.api.getListProps())

    const progress = this.rootEl.querySelector<HTMLElement>(".steps-progress")
    if (progress) this.spreadProps(progress, this.api.getProgressProps())

    const prevButton = this.rootEl.querySelector<HTMLButtonElement>(".steps-prev-trigger")
    if (prevButton) this.spreadProps(prevButton, this.api.getPrevTriggerProps())

    const nextButton = this.rootEl.querySelector<HTMLButtonElement>(".steps-next-trigger")
    if (nextButton) this.spreadProps(nextButton, this.api.getNextTriggerProps())

    // Sync steps and contents
    this.syncSteps()
    this.syncContents()
  }
}
