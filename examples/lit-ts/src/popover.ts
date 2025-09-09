import { spread } from "@open-wc/lit-helpers"
import * as popover from "@zag-js/popover"
import style from "@zag-js/shared/src/css/popover.css?inline"
import { html, unsafeCSS } from "lit"
import { customElement } from "lit/decorators.js"
import { Component } from "./component"
import { normalizeProps, VanillaMachine } from "./lib"

@customElement("popover-element")
export class Popover extends Component<popover.Api> {
  initMachine() {
    return new VanillaMachine(popover.machine, {
      id: this.id,
      getRootNode: () => this.renderRoot,
      positioning: {
        placement: "right",
      },
    })
  }

  initApi() {
    return popover.connect(this.machine.service, normalizeProps)
  }

  static styles = unsafeCSS(style)

  override render() {
    return html`<div class="popover">
      <button ${spread(this.api.getTriggerProps())} class="popover-trigger">Click me</button>
      <div ${spread(this.api.getPositionerProps())} class="popover-positioner">
        <div ${spread(this.api.getContentProps())} class="popover-content">
          <div class="popover-arrow">
            <div class="popover-arrow-tip"></div>
          </div>
          <div>
            <div class="popover-title">
              <b>About Tabs</b>
            </div>
            <div class="popover-description">
              Tabs are used to organize and group content into sections that the user can navigate between.
            </div>
            <button>Action Button</button>
          </div>
        </div>
      </div>
    </div>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "popover-element": Popover
  }
}
