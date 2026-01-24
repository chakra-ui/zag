import * as avatar from "@zag-js/avatar"
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla"
import { Component } from "./component"

export class Avatar extends Component<avatar.Props, avatar.Api> {
  initMachine(props: avatar.Props) {
    return new VanillaMachine(avatar.machine, props)
  }

  initApi() {
    return avatar.connect(this.machine.service, normalizeProps)
  }

  render = () => {
    const rootEl = this.rootEl
    this.spreadProps(this.rootEl, this.api.getRootProps())
    const imageEl = rootEl.querySelector<HTMLElement>(".avatar-image")
    if (imageEl) this.spreadProps(imageEl, this.api.getImageProps())
    const fallbackEl = rootEl.querySelector<HTMLElement>(".avatar-fallback")
    if (fallbackEl) this.spreadProps(fallbackEl, this.api.getFallbackProps())
  }
}
