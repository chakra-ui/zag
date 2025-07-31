import { spread } from "@open-wc/lit-helpers"
import * as avatar from "@zag-js/avatar"
import style from "@zag-js/shared/src/css/avatar.css?inline"
import { html, LitElement, unsafeCSS } from "lit"
import { customElement } from "lit/decorators.js"
import { createId } from "./lib/create-id"
import { ZagController } from "./zag-controller"

@customElement("avatar-ctrl-element")
export class Avatar extends LitElement {
  zag: ZagController<avatar.Api, avatar.Machine>

  constructor() {
    super()
    this.zag = new ZagController(this, avatar.connect, avatar.machine, {
      id: createId(),
      onStatusChange: (details) => {
        console.log("Avatar status changed:", details.status, details)
      },
    })
  }

  static styles = unsafeCSS(style)

  override render() {
    return html`<div ${spread(this.zag.api.getRootProps())} class="avatar">
      <span ${spread(this.zag.api.getFallbackProps())} class="avatar-fallback">PA</span>
      <img
        ${spread(this.zag.api.getImageProps())}
        class="avatar-image"
        alt="Naruto"
        referrerpolicy="no-referrer"
        src="https://static.wikia.nocookie.net/naruto/images/d/d6/Naruto_Part_I.png/revision/latest/top-crop/width/200/height/150?cb=20210223094656"
      />
    </div>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "avatar-ctrl-element": Avatar
  }
}
