import { html, unsafeCSS } from "lit"
import { customElement } from "lit/decorators.js"
import { spread } from "@open-wc/lit-helpers"
import * as accordion from "@zag-js/accordion"
import { accordionControls, accordionData } from "@zag-js/shared"
import styleComponent from "@zag-js/shared/src/css/accordion.css?inline"
import styleLayout from "@zag-js/shared/src/css/layout.css?inline"
import stylePage from "./page.css?inline"
import { ZagController, normalizeProps } from "@zag-js/lit"
import { ArrowRight, createElement } from "lucide"
import { nanoid } from "nanoid"
import { ControlsController } from "../lib/controls-controller"
import { PageElement } from "../lib/page-element"

@customElement("accordion-page")
export class AccordionPage extends PageElement {
  static styles = unsafeCSS(styleComponent + styleLayout + stylePage)

  private controls = new ControlsController(this, accordionControls)

  private zagController = new ZagController(this, accordion.machine, () => ({
    getRootNode: () => this.shadowRoot,
    id: nanoid(),
    ...this.controls.context,
  }))

  render() {
    const api = accordion.connect(this.zagController.service, normalizeProps)

    return html`
      <main class="accordion">
        <div ${spread(api.getRootProps())} part="root">
          ${accordionData.map(
            (item) => html`
              <div ${spread(api.getItemProps({ value: item.id }))} part="item">
                <h3>
                  <button
                    data-testid="${item.id}:trigger"
                    ${spread(api.getItemTriggerProps({ value: item.id }))}
                    part="trigger"
                  >
                    ${item.label}
                    <div ${spread(api.getItemIndicatorProps({ value: item.id }))} part="indicator">
                      ${createElement(ArrowRight)}
                    </div>
                  </button>
                </h3>
                <div
                  data-testid="${item.id}:content"
                  ${spread(api.getItemContentProps({ value: item.id }))}
                  part="content"
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                  dolore magna aliqua.
                </div>
              </div>
            `,
          )}
        </div>
      </main>

      <zag-toolbar .controls=${this.controls}>
        <state-visualizer .state=${this.zagController.service}></state-visualizer>
      </zag-toolbar>
    `
  }
}
