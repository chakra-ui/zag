import { html, unsafeCSS } from "lit"
import { customElement } from "lit/decorators.js"
import { spread } from "@open-wc/lit-helpers"
import * as radio from "@zag-js/radio-group"
import { radioControls, radioData } from "@zag-js/shared"
import styleComponent from "@zag-js/shared/src/css/radio-group.css?inline"
import styleLayout from "@zag-js/shared/src/css/layout.css?inline"
import stylePage from "./page.css?inline"
import { MachineController, normalizeProps } from "@zag-js/lit"
import { nanoid } from "nanoid"
import { ControlsController } from "../lib/controls-controller"
import { PageElement } from "../lib/page-element"

@customElement("radio-group-page")
export class RadioGroupPage extends PageElement {
  static styles = unsafeCSS(styleComponent + styleLayout + stylePage)

  private controls = new ControlsController(this, radioControls)

  private machine = new MachineController(this, radio.machine, () => ({
    getRootNode: () => this.shadowRoot || this.ownerDocument,
    id: nanoid(),
    name: "fruit",
    ...this.controls.context,
  }))

  private handleFormChange = (e: Event) => {
    const form = e.currentTarget as HTMLFormElement
    const formData = new FormData(form)
    const result = Object.fromEntries(formData.entries())
    console.log(result)
  }

  render() {
    const api = radio.connect(this.machine.service, normalizeProps)

    return html`
      <main class="radio">
        <form @change=${this.handleFormChange}>
          <fieldset ?disabled=${false}>
            <div ${spread(api.getRootProps())}>
              <h3 ${spread(api.getLabelProps())}>Fruits</h3>
              <div ${spread(api.getIndicatorProps())}></div>
              ${radioData.map(
                (opt) => html`
                  <label key=${opt.id} data-testid="radio-${opt.id}" ${spread(api.getItemProps({ value: opt.id }))}>
                    <div data-testid="control-${opt.id}" ${spread(api.getItemControlProps({ value: opt.id }))}></div>
                    <span data-testid="label-${opt.id}" ${spread(api.getItemTextProps({ value: opt.id }))}>
                      ${opt.label}
                    </span>
                    <input data-testid="input-${opt.id}" ${spread(api.getItemHiddenInputProps({ value: opt.id }))} />
                  </label>
                `,
              )}
            </div>

            <button type="reset">Reset</button>
            <button type="button" @click=${() => api.clearValue()}>Clear</button>
            <button type="button" @click=${() => api.setValue("mango")}>Set to Mangoes</button>
            <button type="button" @click=${() => api.focus()}>Focus</button>
          </fieldset>
        </form>
      </main>

      <zag-toolbar .controls=${this.controls}>
        <state-visualizer .state=${this.machine.service}></state-visualizer>
      </zag-toolbar>
    `
  }
}
