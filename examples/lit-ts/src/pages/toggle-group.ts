import { html, unsafeCSS } from "lit"
import { customElement } from "lit/decorators.js"
import { spread } from "@open-wc/lit-helpers"
import * as toggleGroup from "@zag-js/toggle-group"
import { toggleGroupControls, toggleGroupData } from "@zag-js/shared"
import styleComponent from "@zag-js/shared/src/css/toggle-group.css?inline"
import styleLayout from "@zag-js/shared/src/css/layout.css?inline"
import stylePage from "./page.css?inline"
import { ZagController, normalizeProps } from "@zag-js/lit"
import { nanoid } from "nanoid"
import { ControlsController } from "../lib/controls-controller"
import { PageElement } from "../lib/page-element"

@customElement("toggle-group-page")
export class ToggleGroupPage extends PageElement {
  static styles = unsafeCSS(styleComponent + styleLayout + stylePage)

  private controls = new ControlsController(this, toggleGroupControls)

  private zagController = new ZagController(this, toggleGroup.machine, () => ({
    getRootNode: () => this.shadowRoot,
    id: nanoid(),
    ...this.controls.context,
  }))

  render() {
    const api = toggleGroup.connect(this.zagController.service, normalizeProps)

    return html`
      <main class="toggle-group">
        <button>Outside</button>
        <div ${spread(api.getRootProps())}>
          ${toggleGroupData.map(
            (item) => html`<button ${spread(api.getItemProps({ value: item.value }))}>${item.label}</button>`,
          )}
        </div>
      </main>

      <zag-toolbar .controls=${this.controls}>
        <state-visualizer .state=${this.zagController.service} .context=${["focusedId"]}></state-visualizer>
      </zag-toolbar>
    `
  }
}
