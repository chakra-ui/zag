import { html, unsafeCSS } from "lit"
import { customElement } from "lit/decorators.js"
import { spread } from "@open-wc/lit-helpers"
import * as dialog from "@zag-js/dialog"
import styleComponent from "@zag-js/shared/src/css/dialog.css?inline"
import styleLayout from "@zag-js/shared/src/css/layout.css?inline"
import stylePage from "./page.css?inline"
import { MachineController, normalizeProps } from "@zag-js/lit"
import { nanoid } from "nanoid"
import { PageElement } from "../lib/page-element"

@customElement("dialog-page")
export class DialogPage extends PageElement {
  static styles = unsafeCSS(styleComponent + styleLayout + stylePage)

  private machine = new MachineController(this, dialog.machine, () => ({
    getRootNode: () => this.shadowRoot,
    id: nanoid(),
  }))

  render() {
    const api = dialog.connect(this.machine.service, normalizeProps)

    return html`
      <main class="dialog">
        <button data-testid="trigger-1" ${spread(api.getTriggerProps())}>Click me</button>

        ${api.open
          ? html`
              <div ${spread(api.getBackdropProps())}></div>
              <div data-testid="positioner-1" ${spread(api.getPositionerProps())}>
                <div ${spread(api.getContentProps())}>
                  <h2 ${spread(api.getTitleProps())}>Edit profile</h2>
                  <p ${spread(api.getDescriptionProps())}>
                    Make changes to your profile here. Click save when you are done.
                  </p>
                  <div>
                    <input placeholder="Enter name..." />
                    <button>Save</button>
                  </div>
                  <button data-testid="close-1" ${spread(api.getCloseTriggerProps())}>Close</button>
                </div>
              </div>
            `
          : ""}
      </main>

      <zag-toolbar>
        <state-visualizer .state=${this.machine.service}></state-visualizer>
      </zag-toolbar>
    `
  }
}
