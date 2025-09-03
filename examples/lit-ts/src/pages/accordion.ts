import { LitElement, html, unsafeCSS } from "lit"
import { customElement } from "lit/decorators.js"
import { spread } from "@open-wc/lit-helpers"
import * as accordion from "@zag-js/accordion"
import { accordionControls, accordionData } from "@zag-js/shared"
import styleComponent from "@zag-js/shared/src/css/accordion.css?inline"
import styleLayout from "@zag-js/shared/src/css/layout.css?inline"
import { ZagController, normalizeProps } from "@zag-js/lit"
import { ArrowRight, createElement } from "lucide"
import { nanoid } from "nanoid"

@customElement("accordion-page")
export class AccordionPage extends LitElement {
  private zagController = new ZagController(this, accordion.machine, () => ({
    id: nanoid(),
    // Add some basic controls for testing
    collapsible: false,
    multiple: false,
  }))

  static styles = unsafeCSS(styleLayout + "\n" + styleComponent)

  // Light dom (no shadow root)
  protected createRenderRoot() {
    return this
  }

  render() {
    const api = accordion.connect(this.zagController.service, normalizeProps)

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

      <div class="toolbar">
        <div class="controls">
          <h3>Controls</h3>
          <p><em>Dynamic controls coming soon...</em></p>
        </div>
        <div class="state-visualizer">
          <h4>State</h4>
          <pre>${JSON.stringify(this.zagController.service.state.get(), null, 2)}</pre>
        </div>
      </div>
    `
  }
}
