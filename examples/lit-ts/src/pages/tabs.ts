import { html, unsafeCSS } from "lit"
import { customElement } from "lit/decorators.js"
import { spread } from "@open-wc/lit-helpers"
import * as tabs from "@zag-js/tabs"
import { tabsControls, tabsData } from "@zag-js/shared"
import styleComponent from "@zag-js/shared/src/css/tabs.css?inline"
import styleLayout from "@zag-js/shared/src/css/layout.css?inline"
import stylePage from "./page.css?inline"
import { MachineController, normalizeProps } from "@zag-js/lit"
import { nanoid } from "nanoid"
import { ControlsController } from "../lib/controls-controller"
import { PageElement } from "../lib/page-element"

@customElement("tabs-page")
export class TabsPage extends PageElement {
  static styles = unsafeCSS(styleComponent + styleLayout + stylePage)

  private controls = new ControlsController(this, tabsControls)
  private machineId = nanoid(5)

  private machine = new MachineController(this, tabs.machine, () => ({
    getRootNode: () => this.shadowRoot || this.ownerDocument,
    id: this.machineId,
    defaultValue: "nils",
    ...this.controls.context,
  }))

  render() {
    const api = tabs.connect(this.machine.service, normalizeProps)

    return html`
      <main class="tabs">
        <div ${spread(api.getRootProps())}>
          <div ${spread(api.getIndicatorProps())}></div>
          <div ${spread(api.getListProps())}>
            ${tabsData.map(
              (data) => html`
                <button ${spread(api.getTriggerProps({ value: data.id }))} data-testid="${data.id}-tab">
                  ${data.label}
                </button>
              `,
            )}
          </div>
          ${tabsData.map(
            (data) => html`
              <div ${spread(api.getContentProps({ value: data.id }))} data-testid="${data.id}-tab-panel">
                <p>${data.content}</p>
                ${data.id === "agnes" ? html`<input placeholder="Agnes" />` : null}
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
