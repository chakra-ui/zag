import * as steps from "@zag-js/steps"
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla"
import { Component } from "./component"

export class Steps extends Component<steps.Props, steps.Api> {
  initMachine(props: steps.Props) {
    return new VanillaMachine(steps.machine, { ...props })
  }

  initApi() {
    return steps.connect(this.machine.service, normalizeProps)
  }

  syncSteps = () => {
    const items = Array.from(this.rootEl.querySelectorAll<HTMLElement>(".steps-item"))

    items.forEach((item, index) => {
      const value = item.dataset.value
      if (!value) return

      this.spreadProps(item, this.api.getItemProps({ value }))

      const indicator = item.querySelector<HTMLElement>(".steps-indicator")
      if (indicator) {
        this.spreadProps(indicator, this.api.getIndicatorProps({ value }))
        indicator.textContent = String(index + 1)
      }

      const trigger = item.querySelector<HTMLElement>(".steps-trigger")
      if (trigger) this.spreadProps(trigger, this.api.getTriggerProps({ value }))

      const separator = item.querySelector<HTMLElement>(".steps-separator")
      if (separator) this.spreadProps(separator, this.api.getSeparatorProps({ value }))
    })
  }

  syncContents = () => {
    const contents = Array.from(this.rootEl.querySelectorAll<HTMLElement>(".steps-content"))
    contents.forEach((content) => {
      const value = content.dataset.value
      if (value) this.spreadProps(content, this.api.getContentProps({ value }))
    })

    const completed = this.rootEl.querySelector<HTMLElement>(".steps-completed-content")
    if (completed) this.spreadProps(completed, this.api.getContentProps({ value: steps.COMPLETE }))
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

    this.syncSteps()
    this.syncContents()
  }
}
