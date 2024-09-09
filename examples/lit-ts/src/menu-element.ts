import { spread } from "@open-wc/lit-helpers"
import * as menu from "@zag-js/menu"
import { StateFrom } from "@zag-js/core"
import { LitElement, html, unsafeCSS } from "lit"
import { customElement, state } from "lit/decorators.js"
import { normalizeProps } from "./normalize-props"
import styles from "../../../shared/src/css/menu.css?inline"

@customElement("menu-element")
export class MenuElement extends LitElement {
  private service: menu.Service

  @state()
  private state: StateFrom<menu.Service>

  constructor() {
    super()
    const host = this
    this.service = menu.machine({
      id: "1",
      onSelect: console.log,
      getRootNode() {
        return host.shadowRoot as ShadowRoot
      },
    })
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
    const api = menu.connect(this.state, this.service.send, normalizeProps)

    return html`
      <button ${spread(api.getTriggerProps())}>Actions <span ${spread(api.getIndicatorProps())}>▾</span></button>
      <div ${spread(api.getPositionerProps())}>
        <ul ${spread(api.getContentProps())}>
          <li ${spread(api.getItemProps({ value: "edit" }))}>Edit</li>
          <li ${spread(api.getItemProps({ value: "duplicate" }))}>Duplicate</li>
          <li ${spread(api.getItemProps({ value: "delete" }))}>Delete</li>
          <li ${spread(api.getItemProps({ value: "export" }))}>Export...</li>
        </ul>
      </div>
    `
  }

  static styles = unsafeCSS(styles)
}

declare global {
  interface HTMLElementTagNameMap {
    "menu-element": MenuElement
  }
}
