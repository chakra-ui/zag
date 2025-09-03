import { spread } from "@open-wc/lit-helpers"
import * as accordion from "@zag-js/accordion"
import { accordionData } from "@zag-js/shared"
import style from "@zag-js/shared/src/css/accordion.css?inline"
import { ZagController, normalizeProps } from "@zag-js/lit"
import { LitElement, html, unsafeCSS } from "lit"
import { customElement } from "lit/decorators.js"
import { nanoid } from "nanoid"

@customElement("accordion-element")
export class Accordion extends LitElement {
  private zag = new ZagController(this, accordion.machine, () => ({ id: nanoid() }))

  static styles = unsafeCSS(style)

  render() {
    const api = accordion.connect(this.zag.service, normalizeProps)

    return html`
      <div ${spread(api.getRootProps())} data-part="root">
        ${accordionData.map(
          (item) => html`
            <div ${spread(api.getItemProps({ value: item.id }))}>
              <h3>
                <button data-testid="${item.id}:trigger" ${spread(api.getItemTriggerProps({ value: item.id }))}>
                  ${item.label}
                  <div ${spread(api.getItemIndicatorProps({ value: item.id }))}>▶</div>
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
    `
  }
}
