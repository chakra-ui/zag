import { spread } from "@open-wc/lit-helpers"
import * as accordion from "@zag-js/accordion"
import { StateFrom } from "@zag-js/core"
import { accordionData } from "@zag-js/shared"
import { LitElement, html, unsafeCSS } from "lit"
import { customElement, state } from "lit/decorators.js"
import { normalizeProps } from "./normalize-props"
import styles from "../../../shared/src/css/accordion.css?inline"

@customElement("accordion-element")
export class AccordionElement extends LitElement {
  private service: accordion.Service

  @state()
  private state: StateFrom<accordion.Service>

  constructor() {
    super()
    this.service = accordion.machine({ id: "1" })
    this.service._created()

    this.state = this.service.getState()
    this.service.subscribe((state) => {
      this.state = state
    })
  }

  connectedCallback(): void {
    super.connectedCallback()
    this.service.start()
  }

  disconnectedCallback(): void {
    super.disconnectedCallback()
    this.service.stop()
  }

  render() {
    const api = accordion.connect(this.state, this.service.send, normalizeProps)

    return html`
      <div ${spread(api.getRootProps())}>
        ${accordionData.map(
          (item) =>
            html`<div ${spread(api.getItemProps({ value: item.id }))}>
              <h3>
                <button data-testid=${`${item.id}:trigger`} ${spread(api.getItemTriggerProps({ value: item.id }))}>
                  ${item.label}
                  <div ${spread(api.getItemIndicatorProps({ value: item.id }))}>
                    <ArrowRight />
                  </div>
                </button>
              </h3>
              <div data-testid=${`${item.id}:content`} ${spread(api.getItemContentProps({ value: item.id }))}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </div>
            </div>`,
        )}
      </div>
    `
  }

  static styles = unsafeCSS(styles)
}

declare global {
  interface HTMLElementTagNameMap {
    "accordion-element": AccordionElement
  }
}
