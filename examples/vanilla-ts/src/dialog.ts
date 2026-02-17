import * as dialog from "@zag-js/dialog"
import { Component } from "./component"
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla"

export class Dialog extends Component<dialog.Props, dialog.Api> {
  initMachine(props: dialog.Props) {
    return new VanillaMachine(dialog.machine, {
      ...props,
    })
  }

  initApi() {
    return dialog.connect(this.machine.service, normalizeProps)
  }

  render() {
    const triggerProps = this.api.getTriggerProps()

    const trigger = this.rootEl.querySelector<HTMLElement>(".dialog-trigger")
    if (trigger) this.spreadProps(trigger, triggerProps)

    // Handle portal content
    const backdrop = this.rootEl.querySelector<HTMLElement>(".dialog-backdrop")
    const positioner = this.rootEl.querySelector<HTMLElement>(".dialog-positioner")

    if (backdrop && positioner) {
      // Show/hide based on dialog state
      if (this.api.open) {
        backdrop.hidden = false
        positioner.hidden = false

        // Apply props
        this.spreadProps(backdrop, this.api.getBackdropProps())
        this.spreadProps(positioner, this.api.getPositionerProps())

        const content = positioner.querySelector<HTMLElement>(".dialog-content")
        const title = positioner.querySelector<HTMLElement>(".dialog-title")
        const description = positioner.querySelector<HTMLElement>(".dialog-description")
        const closeTrigger = positioner.querySelector<HTMLElement>(".dialog-close")

        if (content) this.spreadProps(content, this.api.getContentProps())
        if (title) this.spreadProps(title, this.api.getTitleProps())
        if (description) this.spreadProps(description, this.api.getDescriptionProps())
        if (closeTrigger) this.spreadProps(closeTrigger, this.api.getCloseTriggerProps())
      } else {
        backdrop.hidden = true
        positioner.hidden = true
      }
    }
  }
}
