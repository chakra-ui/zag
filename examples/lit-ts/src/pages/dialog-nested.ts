import { html, unsafeCSS } from "lit"
import { customElement } from "lit/decorators.js"
import { spread } from "@open-wc/lit-helpers"
import * as dialog from "@zag-js/dialog"
import styleComponent from "@zag-js/shared/src/css/dialog.css?inline"
import styleLayout from "@zag-js/shared/src/css/layout.css?inline"
import stylePage from "./page.css?inline"
import { ZagController, normalizeProps } from "@zag-js/lit"
import { nanoid } from "nanoid"
import { PageElement } from "../lib/page-element"

@customElement("dialog-nested-page")
export class DialogNestedPage extends PageElement {
  static styles = unsafeCSS(styleComponent + styleLayout + stylePage)

  // Dialog 1
  private zagController1 = new ZagController(this, dialog.machine, () => ({
    getRootNode: () => this.shadowRoot,
    id: nanoid(),
  }))

  // Dialog 2
  private zagController2 = new ZagController(this, dialog.machine, () => ({
    getRootNode: () => this.shadowRoot,
    id: nanoid(),
  }))

  render() {
    const parentDialog = dialog.connect(this.zagController1.service, normalizeProps)
    const childDialog = dialog.connect(this.zagController2.service, normalizeProps)

    return html`
      <main class="dialog">
        <div>
          <button data-testid="trigger-1" ${spread(parentDialog.getTriggerProps())}>Open Dialog</button>

          <div style="min-height: 1200px"></div>

          ${parentDialog.open
            ? html`
                <div ${spread(parentDialog.getBackdropProps())}></div>
                <div data-testid="positioner-1" ${spread(parentDialog.getPositionerProps())}>
                  <div ${spread(parentDialog.getContentProps())}>
                    <h2 ${spread(parentDialog.getTitleProps())}>Edit profile</h2>
                    <p ${spread(parentDialog.getDescriptionProps())}>
                      Make changes to your profile here. Click save when you are done.
                    </p>
                    <button data-testid="close-1" ${spread(parentDialog.getCloseTriggerProps())}>X</button>
                    <input type="text" placeholder="Enter name..." data-testid="input-1" />
                    <button data-testid="save-button-1">Save Changes</button>

                    <button data-testid="trigger-2" ${spread(childDialog.getTriggerProps())}>Open Nested</button>

                    ${childDialog.open
                      ? html`
                          <div ${spread(childDialog.getBackdropProps())}></div>
                          <div data-testid="positioner-2" ${spread(childDialog.getPositionerProps())}>
                            <div ${spread(childDialog.getContentProps())}>
                              <h2 ${spread(childDialog.getTitleProps())}>Nested</h2>
                              <button data-testid="close-2" ${spread(childDialog.getCloseTriggerProps())}>X</button>
                              <button data-testid="special-close" @click=${() => parentDialog.setOpen(false)}>
                                Close Dialog 1
                              </button>
                            </div>
                          </div>
                        `
                      : ""}
                  </div>
                </div>
              `
            : ""}
        </div>
      </main>

      <zag-toolbar>
        <state-visualizer .state=${this.zagController1.service} label="Dialog 1"></state-visualizer>
        <state-visualizer .state=${this.zagController2.service} label="Dialog 2"></state-visualizer>
      </zag-toolbar>
    `
  }
}
