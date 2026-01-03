import * as floating from "@zag-js/floating-panel"
import { Component } from "./component"
import { normalizeProps, spreadProps, VanillaMachine } from "@zag-js/vanilla"

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
    if (trigger) spreadProps(trigger, this.api.getTriggerProps())

    const positioner = this.doc.querySelector<HTMLElement>(".floating-panel-positioner")
    if (positioner) spreadProps(positioner, this.api.getPositionerProps())

    const content = this.doc.querySelector<HTMLElement>(".floating-panel-content")
    if (content) spreadProps(content, this.api.getContentProps())

    const dragTrigger = this.doc.querySelector<HTMLElement>(".floating-panel-drag-trigger")
    if (dragTrigger) spreadProps(dragTrigger, this.api.getDragTriggerProps())

    const header = this.doc.querySelector<HTMLElement>(".floating-panel-header")
    if (header) spreadProps(header, this.api.getHeaderProps())

    const title = this.doc.querySelector<HTMLElement>(".floating-panel-title")
    if (title) spreadProps(title, this.api.getTitleProps())

    const control = this.doc.querySelector<HTMLElement>(".floating-panel-control")
    if (control) spreadProps(control, this.api.getControlProps())

    const minimizeBtn = this.doc.querySelector<HTMLElement>(".floating-panel-minimize")
    if (minimizeBtn) spreadProps(minimizeBtn, this.api.getStageTriggerProps({ stage: "minimized" }))

    const maximizeBtn = this.doc.querySelector<HTMLElement>(".floating-panel-maximize")
    if (maximizeBtn) spreadProps(maximizeBtn, this.api.getStageTriggerProps({ stage: "maximized" }))

    const defaultBtn = this.doc.querySelector<HTMLElement>(".floating-panel-default")
    if (defaultBtn) spreadProps(defaultBtn, this.api.getStageTriggerProps({ stage: "default" }))

    const closeBtn = this.doc.querySelector<HTMLElement>(".floating-panel-close")
    if (closeBtn) spreadProps(closeBtn, this.api.getCloseTriggerProps())

    const body = this.doc.querySelector<HTMLElement>(".floating-panel-body")
    if (body) spreadProps(body, this.api.getBodyProps())

    // Resize handles
    const axes = ["n", "e", "w", "s", "ne", "se", "sw", "nw"] as const
    axes.forEach((axis) => {
      const handle = this.doc.querySelector<HTMLElement>(`.floating-panel-resize-${axis}`)
      if (handle) spreadProps(handle, this.api.getResizeTriggerProps({ axis }))
    })
  }
}
