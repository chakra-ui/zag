import { spread } from "@open-wc/lit-helpers"
import * as avatar from "@zag-js/avatar"
import { PropTypes } from "@zag-js/types"
import { html, unsafeCSS } from "lit"
import { customElement } from "lit/decorators.js"
import styles from "../../../shared/src/css/avatar.css?inline"
import { Component } from "./component"
import { normalizeProps } from "./normalize-props"

@customElement("avatar-element")
export class AvatarElement extends Component<avatar.Context, avatar.Api, avatar.Service> {
  initService(context: avatar.Context): avatar.Service {
    return avatar.machine({ ...context, id: "1" })
  }

  initApi(): avatar.Api<PropTypes> {
    return avatar.connect(this.state, this.service.send, normalizeProps)
  }

  render() {
    const src =
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aGVhZHNob3R8ZW58MHx8MHx8fDA%3D"

    return html`
      <div ${spread(this.api.getRootProps())}>
        <span ${spread(this.api.getFallbackProps())}>PA</span>
        <img src=${src} ${spread(this.api.getImageProps())} />
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
