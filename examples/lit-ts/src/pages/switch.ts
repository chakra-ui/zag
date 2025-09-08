import { html, unsafeCSS } from "lit"
import { customElement } from "lit/decorators.js"
import { spread } from "@open-wc/lit-helpers"
import * as zagSwitch from "@zag-js/switch"
import { switchControls } from "@zag-js/shared"
import styleComponent from "@zag-js/shared/src/css/switch.css?inline"
import styleLayout from "@zag-js/shared/src/css/layout.css?inline"
import stylePage from "./page.css?inline"
import { MachineController, normalizeProps } from "@zag-js/lit"
import { nanoid } from "nanoid"
import { ControlsController } from "../lib/controls-controller"
import { PageElement } from "../lib/page-element"

@customElement("switch-page")
export class SwitchPage extends PageElement {
  static styles = unsafeCSS(styleComponent + styleLayout + stylePage)

  private controls = new ControlsController(this, switchControls)

  private machine = new MachineController(this, zagSwitch.machine, () => ({
    getRootNode: () => this.shadowRoot || this.ownerDocument,
    id: nanoid(),
    name: "switch",
    ...this.controls.context,
  }))

  render() {
    const api = zagSwitch.connect(this.machine.service, normalizeProps)

    return html`
      <main class="switch">
        <label ${spread(api.getRootProps())}>
          <input ${spread(api.getHiddenInputProps())} data-testid="hidden-input" />
          <span ${spread(api.getControlProps())}>
            <span ${spread(api.getThumbProps())}></span>
          </span>
          <span ${spread(api.getLabelProps())}>Feature is ${api.checked ? "enabled" : "disabled"}</span>
        </label>
      </main>

      <zag-toolbar .controls=${this.controls}>
        <state-visualizer .state=${this.machine.service}></state-visualizer>
      </zag-toolbar>
    `
  }
}
