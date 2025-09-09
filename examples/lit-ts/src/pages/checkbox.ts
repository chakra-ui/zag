import { html, unsafeCSS } from "lit"
import { customElement } from "lit/decorators.js"
import { spread } from "@open-wc/lit-helpers"
import * as checkbox from "@zag-js/checkbox"
import { checkboxControls } from "@zag-js/shared"
import styleComponent from "@zag-js/shared/src/css/checkbox.css?inline"
import styleLayout from "@zag-js/shared/src/css/layout.css?inline"
import stylePage from "./page.css?inline"
import { MachineController, normalizeProps } from "@zag-js/lit"
import { nanoid } from "nanoid"
import { ControlsController } from "../lib/controls-controller"
import { PageElement } from "../lib/page-element"

@customElement("checkbox-page")
export class CheckboxPage extends PageElement {
  static styles = unsafeCSS(styleComponent + styleLayout + stylePage)

  private controls = new ControlsController(this, checkboxControls)
  private machineId = nanoid(5)

  private machine = new MachineController(this, checkbox.machine, () => ({
    getRootNode: () => this.shadowRoot || this.ownerDocument,
    id: this.machineId,
    name: "checkbox",
    ...this.controls.context,
  }))

  private handleFormChange = (e: Event) => {
    const form = e.currentTarget as HTMLFormElement
    const formData = new FormData(form)
    const result = Object.fromEntries(formData.entries())
    console.log(result)
  }

  render() {
    const api = checkbox.connect(this.machine.service, normalizeProps)

    return html`
      <main class="checkbox">
        <form @change=${this.handleFormChange}>
          <fieldset>
            <label ${spread(api.getRootProps())}>
              <div ${spread(api.getControlProps())}></div>
              <span ${spread(api.getLabelProps())}>Input ${api.checked ? "Checked" : "Unchecked"}</span>
              <input ${spread(api.getHiddenInputProps())} data-testid="hidden-input" />
              <div ${spread(api.getIndicatorProps())}>Indicator</div>
            </label>

            <button type="button" ?disabled=${api.checked} @click=${() => api.setChecked(true)}>Check</button>
            <button type="button" ?disabled=${!api.checked} @click=${() => api.setChecked(false)}>Uncheck</button>
            <button type="reset">Reset Form</button>
          </fieldset>
        </form>
      </main>

      <zag-toolbar .controls=${this.controls}>
        <state-visualizer .state=${this.machine.service}></state-visualizer>
      </zag-toolbar>
    `
  }
}
