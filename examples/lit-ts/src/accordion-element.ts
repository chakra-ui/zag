import { spread } from "@open-wc/lit-helpers"
import * as accordion from "@zag-js/accordion"
import { accordionData } from "@zag-js/shared"
import { PropTypes } from "@zag-js/types"
import { html, unsafeCSS } from "lit"
import { customElement } from "lit/decorators.js"
import styles from "../../../shared/src/css/accordion.css?inline"
import { Component } from "./component"
import { normalizeProps } from "./normalize-props"

@customElement("accordion-element")
export class AccordionElement extends Component<
  accordion.Context,
  accordion.MachineContext,
  accordion.Api,
  accordion.Service
> {
  initService(context: accordion.Context): accordion.Service {
    return accordion.machine({ ...context, id: "1" })
  }

  initApi(): accordion.Api<PropTypes> {
    return accordion.connect(this.state, this.service.send, normalizeProps)
  }

  render() {
    return html`
      <div ${spread(this.api.getRootProps())}>
        ${accordionData.map(
          (item) =>
            html`<div ${spread(this.api.getItemProps({ value: item.id }))}>
              <h3>
                <button data-testid=${`${item.id}:trigger`} ${spread(this.api.getItemTriggerProps({ value: item.id }))}>
                  ${item.label}
                  <div ${spread(this.api.getItemIndicatorProps({ value: item.id }))}>
                    <ArrowRight />
                  </div>
                </button>
              </h3>
              <div data-testid=${`${item.id}:content`} ${spread(this.api.getItemContentProps({ value: item.id }))}>
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
