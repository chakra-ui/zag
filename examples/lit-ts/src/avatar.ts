import { spread } from "@open-wc/lit-helpers"
import * as avatar from "@zag-js/avatar"
import style from "@zag-js/shared/src/css/avatar.css?inline"
import { html, unsafeCSS } from "lit"
import { customElement } from "lit/decorators.js"
import { Component } from "./component"
import { normalizeProps, VanillaMachine } from "./lib"

@customElement("avatar-element")
export class Avatar extends Component<avatar.Api> {
  initMachine() {
    return new VanillaMachine(avatar.machine, { id: this.id })
  }

  initApi() {
    return avatar.connect(this.machine.service, normalizeProps)
  }

  static styles = unsafeCSS(style)

  override render() {
    console.log("rendering", {
      getRootProps: this.api.getRootProps(),
      getFallbackProps: this.api.getFallbackProps(),
      getImageProps: this.api.getImageProps(),
    })
    return html`<div ${spread(this.api.getRootProps())} class="avatar">
      <span ${spread(this.api.getFallbackProps())} class="avatar-fallback">PA</span>
      <img
        ${spread(this.api.getImageProps())}
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
    "avatar-element": Avatar
  }
}
