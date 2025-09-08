import { html, unsafeCSS } from "lit"
import { customElement } from "lit/decorators.js"
import { spread } from "@open-wc/lit-helpers"
import * as toggle from "@zag-js/toggle"
import styleComponent from "@zag-js/shared/src/css/toggle.css?inline"
import styleLayout from "@zag-js/shared/src/css/layout.css?inline"
import stylePage from "./page.css?inline"
import { MachineController, normalizeProps } from "@zag-js/lit"
import { Bold, createElement } from "lucide"
import { PageElement } from "../lib/page-element"

@customElement("toggle-page")
export class TogglePage extends PageElement {
  static styles = unsafeCSS(styleComponent + styleLayout + stylePage)

  private machine = new MachineController(this, toggle.machine)

  render() {
    const api = toggle.connect(this.machine.service, normalizeProps)

    return html`
      <main class="toggle">
        <button ${spread(api.getRootProps())}>
          <span ${spread(api.getIndicatorProps())}> ${createElement(Bold)} </span>
        </button>
      </main>

      <zag-toolbar>
        <state-visualizer .state=${this.machine.service}></state-visualizer>
      </zag-toolbar>
    `
  }
}
