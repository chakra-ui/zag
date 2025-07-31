import { spread } from "@open-wc/lit-helpers"
import * as checkbox from "@zag-js/checkbox"
import style from "@zag-js/shared/src/css/checkbox.css?inline"
import { html, unsafeCSS } from "lit"
import { customElement } from "lit/decorators.js"
import { Component } from "./component"
import { normalizeProps, VanillaMachine } from "./lib"

@customElement("checkbox-element")
export class Checkbox extends Component<checkbox.Api> {
  ctx = checkbox.machine.context

  initMachine() {
    return new VanillaMachine(checkbox.machine, { id: this.id, defaultChecked: true })
  }

  initApi() {
    return checkbox.connect(this.machine.service, normalizeProps)
  }

  static styles = unsafeCSS(style)

  override render() {
    console.log("rendering", {
      getRootProps: this.api.getRootProps(),
      getControlProps: this.api.getControlProps(),
      getLabelProps: this.api.getLabelProps(),
      getHiddenInputProps: this.api.getHiddenInputProps(),
    })
    return html`<label ${spread(this.api.getRootProps())} class="checkbox">
      <div ${spread(this.api.getControlProps())} class="checkbox-control"></div>
      <span ${spread(this.api.getLabelProps())} class="checkbox-label">Checkbox Label</span>
      <input ${spread(this.api.getHiddenInputProps())} class="checkbox-input" type="checkbox" />
    </label>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "checkbox-element": Checkbox
  }
}
