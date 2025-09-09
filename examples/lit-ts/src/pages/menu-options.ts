import { html, unsafeCSS } from "lit"
import { customElement, state } from "lit/decorators.js"
import { spread } from "@open-wc/lit-helpers"
import * as menu from "@zag-js/menu"
import { menuOptionData, menuControls } from "@zag-js/shared"
import styleComponent from "@zag-js/shared/src/css/menu.css?inline"
import styleLayout from "@zag-js/shared/src/css/layout.css?inline"
import stylePage from "./page.css?inline"
import { MachineController, normalizeProps } from "@zag-js/lit"
import { nanoid } from "nanoid"
import { ControlsController } from "../lib/controls-controller"
import { PageElement } from "../lib/page-element"

@customElement("menu-options-page")
export class MenuOptionsPage extends PageElement {
  static styles = unsafeCSS(styleComponent + styleLayout + stylePage)

  private controls = new ControlsController(this, menuControls)
  private machineId = nanoid(5)

  private machine = new MachineController(this, menu.machine, () => ({
    getRootNode: () => this.shadowRoot || this.ownerDocument,
    id: this.machineId,
    ...this.controls.context,
  }))

  @state()
  private order = ""

  @state()
  private type: string[] = []

  private setOrder = (value: string, checked: boolean) => {
    this.order = checked ? value : ""
  }

  private setType = (value: string, checked: boolean) => {
    if (checked) {
      this.type = [...this.type, value]
    } else {
      this.type = this.type.filter((x) => x !== value)
    }
  }

  render() {
    const api = menu.connect(this.machine.service, normalizeProps)

    const radios = menuOptionData.order.map((item) => ({
      type: "radio" as const,
      name: "order",
      value: item.value,
      label: item.label,
      checked: this.order === item.value,
      onCheckedChange: (checked: boolean) => this.setOrder(item.value, checked),
    }))

    const checkboxes = menuOptionData.type.map((item) => ({
      type: "checkbox" as const,
      name: "type",
      value: item.value,
      label: item.label,
      checked: this.type.includes(item.value),
      onCheckedChange: (checked: boolean) => this.setType(item.value, checked),
    }))

    return html`
      <main>
        <div>
          <button data-testid="trigger" ${spread(api.getTriggerProps())}>
            Actions <span ${spread(api.getIndicatorProps())}>▾</span>
          </button>

          <div ${spread(api.getPositionerProps())}>
            <div ${spread(api.getContentProps())}>
              ${radios.map(
                (item) => html`
                  <div key=${item.value} ${spread(api.getOptionItemProps(item))}>
                    <span ${spread(api.getItemIndicatorProps(item))}>✅</span>
                    <span ${spread(api.getItemTextProps(item))}>${item.label}</span>
                  </div>
                `,
              )}
              <hr />
              ${checkboxes.map(
                (item) => html`
                  <div key=${item.value} ${spread(api.getOptionItemProps(item))}>
                    <span ${spread(api.getItemIndicatorProps(item))}>✅</span>
                    <span ${spread(api.getItemTextProps(item))}>${item.label}</span>
                  </div>
                `,
              )}
            </div>
          </div>
        </div>
      </main>

      <zag-toolbar .controls=${this.controls}>
        <state-visualizer .state=${this.machine.service}></state-visualizer>
      </zag-toolbar>
    `
  }
}
