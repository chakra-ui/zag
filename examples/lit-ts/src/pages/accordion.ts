import { html, unsafeCSS } from "lit"
import { customElement } from "lit/decorators.js"
import { spread } from "@open-wc/lit-helpers"
import * as accordion from "@zag-js/accordion"
import { accordionControls, accordionData } from "@zag-js/shared"
import styleComponent from "@zag-js/shared/src/css/accordion.css?inline"
import styleLayout from "@zag-js/shared/src/css/layout.css?inline"
import stylePage from "./page.css?inline"
import { MachineController, normalizeProps } from "@zag-js/lit"
import { ArrowRight, createElement } from "lucide"
import { nanoid } from "nanoid"
import { ControlsController } from "../lib/controls-controller"
import { PageElement } from "../lib/page-element"

@customElement("accordion-page")
export class AccordionPage extends PageElement {
  static styles = unsafeCSS(styleComponent + styleLayout + stylePage)

  private controls = new ControlsController(this, accordionControls)

  private machine = new MachineController(this, accordion.machine, () => ({
    getRootNode: () => this.shadowRoot || this.ownerDocument,
    id: nanoid(),
    ...this.controls.context,
  }))

  render() {
    const api = accordion.connect(this.machine.service, normalizeProps)

    return html`
      <main class="accordion">
        <div ${spread(api.getRootProps())}>
          ${accordionData.map(
            (item) => html`
              <div ${spread(api.getItemProps({ value: item.id }))}>
                <h3>
                  <button data-testid="${item.id}:trigger" ${spread(api.getItemTriggerProps({ value: item.id }))}>
                    ${item.label}
                    <div ${spread(api.getItemIndicatorProps({ value: item.id }))}>${createElement(ArrowRight)}</div>
                  </button>
                </h3>
                <div data-testid="${item.id}:content" ${spread(api.getItemContentProps({ value: item.id }))}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                  dolore magna aliqua.
                </div>
              </div>
            `,
          )}
        </div>
      </main>

      <zag-toolbar .controls=${this.controls}>
        <state-visualizer .state=${this.machine.service}></state-visualizer>
      </zag-toolbar>
    `
  }
}
