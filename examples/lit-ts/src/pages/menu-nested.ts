import { html, unsafeCSS } from "lit"
import { customElement } from "lit/decorators.js"
import { spread } from "@open-wc/lit-helpers"
import * as menu from "@zag-js/menu"
import { menuData } from "@zag-js/shared"
import styleComponent from "@zag-js/shared/src/css/menu.css?inline"
import styleLayout from "@zag-js/shared/src/css/layout.css?inline"
import stylePage from "./page.css?inline"
import { MachineController, normalizeProps } from "@zag-js/lit"
import { nanoid } from "nanoid"
import { PageElement } from "../lib/page-element"

@customElement("menu-nested-page")
export class MenuNestedPage extends PageElement {
  static styles = unsafeCSS(styleComponent + styleLayout + stylePage)

  private rootMachine = new MachineController(this, menu.machine, () => ({
    getRootNode: () => this.shadowRoot || this.ownerDocument,
    id: nanoid(),
  }))

  private subMachine = new MachineController(this, menu.machine, () => ({
    getRootNode: () => this.shadowRoot || this.ownerDocument,
    id: nanoid(),
  }))

  private sub2Machine = new MachineController(this, menu.machine, () => ({
    getRootNode: () => this.shadowRoot || this.ownerDocument,
    id: nanoid(),
  }))

  protected firstUpdated() {
    const root = menu.connect(this.rootMachine.service, normalizeProps)
    const sub = menu.connect(this.subMachine.service, normalizeProps)
    const sub2 = menu.connect(this.sub2Machine.service, normalizeProps)

    root.setChild(this.subMachine.service)
    sub.setParent(this.rootMachine.service)

    sub.setChild(this.sub2Machine.service)
    sub2.setParent(this.subMachine.service)
  }

  render() {
    const root = menu.connect(this.rootMachine.service, normalizeProps)
    const sub = menu.connect(this.subMachine.service, normalizeProps)
    const sub2 = menu.connect(this.sub2Machine.service, normalizeProps)

    const triggerItemProps = root.getTriggerItemProps(sub)
    const triggerItem2Props = sub.getTriggerItemProps(sub2)

    const [level1, level2, level3] = menuData

    return html`
      <main>
        <div>
          <button data-testid="trigger" ${spread(root.getTriggerProps())}>Click me</button>

          <!-- Portal -->
          <div ${spread(root.getPositionerProps())}>
            <ul data-testid="menu" ${spread(root.getContentProps())}>
              ${level1.map((item) => {
                const props = item.trigger ? triggerItemProps : root.getItemProps({ value: item.value })
                return html` <li key=${item.value} data-testid=${item.value} ${spread(props)}>${item.label}</li> `
              })}
            </ul>
          </div>

          <!-- Portal -->
          <div ${spread(sub.getPositionerProps())}>
            <ul data-testid="more-tools-submenu" ${spread(sub.getContentProps())}>
              ${level2.map((item) => {
                const props = item.trigger ? triggerItem2Props : sub.getItemProps({ value: item.value })
                return html` <li key=${item.value} data-testid=${item.value} ${spread(props)}>${item.label}</li> `
              })}
            </ul>
          </div>

          <!-- Portal -->
          <div ${spread(sub2.getPositionerProps())}>
            <ul data-testid="open-nested-submenu" ${spread(sub2.getContentProps())}>
              ${level3.map(
                (item) => html`
                  <li key=${item.value} data-testid=${item.value} ${spread(sub2.getItemProps({ value: item.value }))}>
                    ${item.label}
                  </li>
                `,
              )}
            </ul>
          </div>
        </div>
      </main>

      <zag-toolbar .controls=${null}>
        <state-visualizer .state=${this.rootMachine.service} label="Root Machine"></state-visualizer>
        <state-visualizer .state=${this.subMachine.service} label="Sub Machine"></state-visualizer>
        <state-visualizer .state=${this.sub2Machine.service} label="Sub2 Machine"></state-visualizer>
      </zag-toolbar>
    `
  }
}
