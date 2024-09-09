import { spread } from "@open-wc/lit-helpers"
import * as avatar from "@zag-js/avatar"
import { StateFrom } from "@zag-js/core"
import { LitElement, html, unsafeCSS } from "lit"
import { customElement, state } from "lit/decorators.js"
import { normalizeProps } from "./normalize-props"
import styles from "../../../shared/src/css/avatar.css?inline"

@customElement("avatar-element")
export class AvatarElement extends LitElement {
  private service: avatar.Service

  @state()
  private state: StateFrom<avatar.Service>

  constructor() {
    super()
    this.service = avatar.machine({ id: "1" })
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
    const api = avatar.connect(this.state, this.service.send, normalizeProps)
    const src =
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aGVhZHNob3R8ZW58MHx8MHx8fDA%3D"

    return html`
      <div ${spread(api.getRootProps())}>
        <span ${spread(api.getFallbackProps())}>PA</span>
        <img src=${src} ${spread(api.getImageProps())} />
      </div>
    `
  }

  static styles = unsafeCSS(styles)
}

declare global {
  interface HTMLElementTagNameMap {
    "avatar-element": AvatarElement
  }
}
