import { spread } from "@open-wc/lit-helpers"
import { Machine } from "@zag-js/core"
import * as menu from "@zag-js/menu"
import { PropTypes } from "@zag-js/types"
import { html, unsafeCSS } from "lit"
import { customElement } from "lit/decorators.js"
import styles from "../../../shared/src/css/menu.css?inline"
import { Component } from "./component"
import { normalizeProps } from "./normalize-props"

@customElement("menu-element")
export class MenuElement extends Component<menu.Context, menu.Api, menu.Service> {
  initService(context: menu.Context): Machine<any, any, any> {
    const host = this

    return menu.machine({
      ...context,
      id: "1",
      onSelect: console.log,
      getRootNode() {
        return host.shadowRoot as ShadowRoot
      },
    })
  }

  initApi(): menu.Api<PropTypes> {
    return menu.connect(this.state, this.service.send, normalizeProps)
  }

  render() {
    return html`
      <button ${spread(this.api.getTriggerProps())}>
        Actions <span ${spread(this.api.getIndicatorProps())}>▾</span>
      </button>
      <div ${spread(this.api.getPositionerProps())}>
        <ul ${spread(this.api.getContentProps())}>
          <li ${spread(this.api.getItemProps({ value: "edit" }))}>Edit</li>
          <li ${spread(this.api.getItemProps({ value: "duplicate" }))}>Duplicate</li>
          <li ${spread(this.api.getItemProps({ value: "delete" }))}>Delete</li>
          <li ${spread(this.api.getItemProps({ value: "export" }))}>Export...</li>
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
