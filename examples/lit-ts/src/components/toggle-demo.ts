import { LitElement, html, css } from "lit"
import { customElement } from "lit/decorators.js"
import * as toggle from "@zag-js/toggle"
import { ZagController } from "@zag-js/lit"

@customElement("toggle-demo")
export class ToggleDemo extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .toggle-button {
      padding: 12px 16px;
      border: 2px solid #ccc;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 14px;
    }

    .toggle-button[data-state="on"] {
      background: #007acc;
      color: white;
      border-color: #007acc;
    }

    .toggle-button:hover {
      opacity: 0.8;
    }

    .toggle-button:focus {
      outline: 2px solid #007acc;
      outline-offset: 2px;
    }
  `

  private zagController = new ZagController(this, toggle.machine, toggle.connect, { id: "toggle-demo" })

  render() {
    const { api } = this.zagController

    return html`
      <div>
        <h3>Toggle Demo</h3>
        <button class="toggle-button" ${api.rootProps} data-part="root">${api.pressed ? "ON" : "OFF"}</button>
        <p>Current state: ${api.pressed ? "Pressed" : "Not Pressed"}</p>
      </div>
    `
  }
}
