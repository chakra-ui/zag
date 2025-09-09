import { html, unsafeCSS } from "lit"
import { customElement } from "lit/decorators.js"
import { spread } from "@open-wc/lit-helpers"
import * as slider from "@zag-js/slider"
import { sliderControls } from "@zag-js/shared"
import styleComponent from "@zag-js/shared/src/css/slider.css?inline"
import styleLayout from "@zag-js/shared/src/css/layout.css?inline"
import stylePage from "./page.css?inline"
import { MachineController, normalizeProps } from "@zag-js/lit"
import { nanoid } from "nanoid"
import serialize from "form-serialize"
import { ControlsController } from "../lib/controls-controller"
import { PageElement } from "../lib/page-element"

@customElement("range-slider-page")
export class RangeSliderPage extends PageElement {
  static styles = unsafeCSS(styleComponent + styleLayout + stylePage)

  private controls = new ControlsController(this, sliderControls)
  private machineId = nanoid(5)

  private machine = new MachineController(this, slider.machine, () => ({
    getRootNode: () => this.shadowRoot || this.ownerDocument,
    id: this.machineId,
    name: "quantity",
    defaultValue: [10, 60],
    ...this.controls.context,
  }))

  private handleFormChange = (e: Event) => {
    const form = e.currentTarget as HTMLFormElement
    const formData = serialize(form, { hash: true })
    console.log(formData)
  }

  render() {
    const api = slider.connect(this.machine.service, normalizeProps)

    return html`
      <main class="slider">
        <form @input=${this.handleFormChange}>
          <div ${spread(api.getRootProps())}>
            <div>
              <label ${spread(api.getLabelProps())}>Quantity:</label>
              <output ${spread(api.getValueTextProps())}>${api.value.join(" - ")}</output>
            </div>
            <div class="control-area">
              <div ${spread(api.getControlProps())}>
                <div ${spread(api.getTrackProps())}>
                  <div ${spread(api.getRangeProps())}></div>
                </div>
                ${api.value.map(
                  (_, index) => html`
                    <div key=${index} ${spread(api.getThumbProps({ index }))}>
                      <input ${spread(api.getHiddenInputProps({ index }))} />
                    </div>
                  `,
                )}
              </div>
              <div ${spread(api.getMarkerGroupProps())}>
                <span ${spread(api.getMarkerProps({ value: 10 }))}>*</span>
                <span ${spread(api.getMarkerProps({ value: 30 }))}>*</span>
                <span ${spread(api.getMarkerProps({ value: 50 }))}>*</span>
                <span ${spread(api.getMarkerProps({ value: 90 }))}>*</span>
              </div>
            </div>
          </div>
        </form>
      </main>

      <zag-toolbar .controls=${this.controls}>
        <state-visualizer .state=${this.machine.service}></state-visualizer>
      </zag-toolbar>
    `
  }
}
