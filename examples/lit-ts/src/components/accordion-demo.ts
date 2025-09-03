import { LitElement, html, css } from "lit"
import { customElement } from "lit/decorators.js"
import { spread } from "@open-wc/lit-helpers"
import * as accordion from "@zag-js/accordion"
import { ZagController, normalizeProps } from "@zag-js/lit"

// Sample data matching other framework examples
const accordionData = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
]

@customElement("accordion-demo")
export class AccordionDemo extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .accordion-item {
      border-bottom: 1px solid #e5e7eb;
    }

    .accordion-trigger {
      width: 100%;
      padding: 16px;
      text-align: left;
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
      font-weight: 500;
    }

    .accordion-trigger:hover {
      background: #f9fafb;
    }

    .accordion-indicator {
      transition: transform 0.2s;
    }

    .accordion-item[data-state="open"] .accordion-indicator {
      transform: rotate(90deg);
    }

    .accordion-content {
      padding: 0 16px;
      overflow: hidden;
    }

    .accordion-content[data-state="open"] {
      padding: 16px;
    }

    .accordion-content[data-state="closed"] {
      display: none;
    }
  `

  private zagController = new ZagController(this, accordion.machine, () => ({ id: "accordion-demo" }))

  render() {
    const api = accordion.connect(this.zagController.service, normalizeProps)

    return html`
      <div ${spread(api.getRootProps())} data-part="root">
        ${accordionData.map(
          (item) => html`
            <div class="accordion-item" ${spread(api.getItemProps({ value: item.id }))}>
              <h3>
                <button
                  class="accordion-trigger"
                  data-testid="${item.id}:trigger"
                  ${spread(api.getItemTriggerProps({ value: item.id }))}
                >
                  ${item.label}
                  <div class="accordion-indicator" ${spread(api.getItemIndicatorProps({ value: item.id }))}>▶</div>
                </button>
              </h3>
              <div
                class="accordion-content"
                data-testid="${item.id}:content"
                ${spread(api.getItemContentProps({ value: item.id }))}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </div>
            </div>
          `,
        )}
      </div>
    `
  }
}
