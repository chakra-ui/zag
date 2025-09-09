import { spread } from "@open-wc/lit-helpers"
import * as accordion from "@zag-js/accordion"
import style from "@zag-js/shared/src/css/accordion.css?inline"
import { html, unsafeCSS } from "lit"
import { customElement } from "lit/decorators.js"
import { Component } from "./component"
import { normalizeProps, VanillaMachine } from "./lib"

@customElement("accordion-element")
export class Accordion extends Component<accordion.Api> {
  initMachine() {
    return new VanillaMachine(accordion.machine, { id: this.id, multiple: true })
  }

  initApi() {
    return accordion.connect(this.machine.service, normalizeProps)
  }

  static styles = unsafeCSS(style)

  override render() {
    return html`<div ${spread(this.api.getRootProps())} class="accordion">
      <div ${spread(this.api.getItemProps({ value: "a" }))} class="accordion-item">
        <button ${spread(this.api.getItemTriggerProps({ value: "a" }))} class="accordion-trigger">First Button</button>
        <div ${spread(this.api.getItemContentProps({ value: "a" }))} class="accordion-content">First Content</div>
      </div>

      <div ${spread(this.api.getItemProps({ value: "b" }))} class="accordion-item">
        <button ${spread(this.api.getItemTriggerProps({ value: "b" }))} class="accordion-trigger">Second Button</button>
        <div ${spread(this.api.getItemContentProps({ value: "b" }))} class="accordion-content">Second Content</div>
      </div>

      <div ${spread(this.api.getItemProps({ value: "c" }))} class="accordion-item">
        <button ${spread(this.api.getItemTriggerProps({ value: "c" }))} class="accordion-trigger">Third Button</button>
        <div ${spread(this.api.getItemContentProps({ value: "c" }))} class="accordion-content">Third Content</div>
      </div>
    </div>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "accordion-element": Accordion
  }
}
