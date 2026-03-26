import * as floating from "@zag-js/floating-panel"
import { Component } from "./component"
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla"

export class FloatingPanel extends Component<floating.Props, floating.Api> {
  initMachine(props: floating.Props) {
    return new VanillaMachine(floating.machine, {
      ...props,
    })
  }

  initApi() {
    return floating.connect(this.machine.service, normalizeProps)
  }

  render() {
    const trigger = this.doc.querySelector<HTMLElement>(".floating-panel-trigger")
    if (trigger) this.spreadProps(trigger, this.api.getTriggerProps())

    const positioner = this.doc.querySelector<HTMLElement>(".floating-panel-positioner")
    if (positioner) this.spreadProps(positioner, this.api.getPositionerProps())

    const content = this.doc.querySelector<HTMLElement>(".floating-panel-content")
    if (content) this.spreadProps(content, this.api.getContentProps())

    const dragTrigger = this.doc.querySelector<HTMLElement>(".floating-panel-drag-trigger")
    if (dragTrigger) this.spreadProps(dragTrigger, this.api.getDragTriggerProps())

    const header = this.doc.querySelector<HTMLElement>(".floating-panel-header")
    if (header) this.spreadProps(header, this.api.getHeaderProps())

    const title = this.doc.querySelector<HTMLElement>(".floating-panel-title")
    if (title) this.spreadProps(title, this.api.getTitleProps())

    const control = this.doc.querySelector<HTMLElement>(".floating-panel-control")
    if (control) this.spreadProps(control, this.api.getControlProps())

    const minimizeBtn = this.doc.querySelector<HTMLElement>(".floating-panel-minimize")
    if (minimizeBtn) this.spreadProps(minimizeBtn, this.api.getStageTriggerProps({ stage: "minimized" }))

    const maximizeBtn = this.doc.querySelector<HTMLElement>(".floating-panel-maximize")
    if (maximizeBtn) this.spreadProps(maximizeBtn, this.api.getStageTriggerProps({ stage: "maximized" }))

    const defaultBtn = this.doc.querySelector<HTMLElement>(".floating-panel-default")
    if (defaultBtn) this.spreadProps(defaultBtn, this.api.getStageTriggerProps({ stage: "default" }))

    const closeBtn = this.doc.querySelector<HTMLElement>(".floating-panel-close")
    if (closeBtn) this.spreadProps(closeBtn, this.api.getCloseTriggerProps())

    const body = this.doc.querySelector<HTMLElement>(".floating-panel-body")
    if (body) this.spreadProps(body, this.api.getBodyProps())

    // Resize handles
    const axes = ["n", "e", "w", "s", "ne", "se", "sw", "nw"] as const
    axes.forEach((axis) => {
      const handle = this.doc.querySelector<HTMLElement>(`.floating-panel-resize-${axis}`)
      if (handle) this.spreadProps(handle, this.api.getResizeTriggerProps({ axis }))
    })
  }
}
