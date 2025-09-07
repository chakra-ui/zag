import { html, unsafeCSS } from "lit"
import { customElement } from "lit/decorators.js"
import { spread } from "@open-wc/lit-helpers"
import * as popover from "@zag-js/popover"
import { popoverControls } from "@zag-js/shared"
import styleComponent from "@zag-js/shared/src/css/popover.css?inline"
import styleLayout from "@zag-js/shared/src/css/layout.css?inline"
import stylePage from "./page.css?inline"
import { MachineController, normalizeProps } from "@zag-js/lit"
import { nanoid } from "nanoid"
import { ControlsController } from "../lib/controls-controller"
import { PageElement } from "../lib/page-element"

@customElement("popover-page")
export class PopoverPage extends PageElement {
  static styles = unsafeCSS(styleComponent + styleLayout + stylePage)

  private controls = new ControlsController(this, popoverControls)

  private machine = new MachineController(this, popover.machine, () => ({
    getRootNode: () => this.shadowRoot,
    id: nanoid(),
    ...this.controls.context,
  }))

  render() {
    const api = popover.connect(this.machine.service, normalizeProps)

    return html`
      <main class="popover">
        <div data-part="root">
          <button data-testid="button-before">Button :before</button>

          <button data-testid="popover-trigger" ${spread(api.getTriggerProps())}>
            Click me
            <div ${spread(api.getIndicatorProps())}>></div>
          </button>

          <div ${spread(api.getAnchorProps())}>anchor</div>

          ${api.open
            ? html`
                <div ${spread(api.getPositionerProps())}>
                  <div data-testid="popover-content" class="popover-content" ${spread(api.getContentProps())}>
                    <div ${spread(api.getArrowProps())}>
                      <div ${spread(api.getArrowTipProps())}></div>
                    </div>
                    <div data-testid="popover-title" ${spread(api.getTitleProps())}>Popover Title</div>
                    <div data-part="body" data-testid="popover-body">
                      <a>Non-focusable Link</a>
                      <a href="#" data-testid="focusable-link">Focusable Link</a>
                      <input data-testid="input" placeholder="input" />
                      <button data-testid="popover-close-button" ${spread(api.getCloseTriggerProps())}>X</button>
                    </div>
                  </div>
                </div>
              `
            : ""}
          <span data-testid="plain-text">I am just text</span>
          <button data-testid="button-after">Button :after</button>
        </div>
      </main>

      <zag-toolbar .controls=${this.controls}>
        <state-visualizer .state=${this.machine.service}></state-visualizer>
      </zag-toolbar>
    `
  }
}
