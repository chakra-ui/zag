import * as splitter from "@zag-js/splitter"
import { Component } from "./component"
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla"

export class Splitter extends Component<splitter.Props, splitter.Api> {
  initMachine(props: splitter.Props) {
    return new VanillaMachine(splitter.machine, {
      ...props,
    })
  }

  initApi() {
    return splitter.connect(this.machine.service, normalizeProps)
  }

  render() {
    this.spreadProps(this.rootEl, this.api.getRootProps())

    // Update sizes display
    const sizesDisplay = this.rootEl.querySelector<HTMLElement>(".splitter-sizes")
    if (sizesDisplay) {
      sizesDisplay.textContent = JSON.stringify(this.api.getSizes(), null, 2)
    }

    // Panel A
    const panelA = this.rootEl.querySelector<HTMLElement>(".splitter-panel-a")
    if (panelA) this.spreadProps(panelA, this.api.getPanelProps({ id: "a" }))

    // Resize trigger A:B
    const triggerAB = this.rootEl.querySelector<HTMLElement>(".splitter-trigger-ab")
    if (triggerAB) this.spreadProps(triggerAB, this.api.getResizeTriggerProps({ id: "a:b" }))

    // Panel B
    const panelB = this.rootEl.querySelector<HTMLElement>(".splitter-panel-b")
    if (panelB) this.spreadProps(panelB, this.api.getPanelProps({ id: "b" }))

    // Resize trigger B:C
    const triggerBC = this.rootEl.querySelector<HTMLElement>(".splitter-trigger-bc")
    if (triggerBC) this.spreadProps(triggerBC, this.api.getResizeTriggerProps({ id: "b:c" }))

    // Panel C
    const panelC = this.rootEl.querySelector<HTMLElement>(".splitter-panel-c")
    if (panelC) this.spreadProps(panelC, this.api.getPanelProps({ id: "c" }))
  }
}
