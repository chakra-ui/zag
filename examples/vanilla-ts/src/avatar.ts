import * as avatar from "@zag-js/avatar"
import { normalizeProps } from "./normalize-props"
import { spreadProps } from "./spread-props"
import { Component } from "./component"

export class Avatar extends Component<avatar.Context, avatar.Api<any>> {
  initService(context: avatar.Context) {
    this.service = avatar.machine(context)
  }

  initApi(): avatar.Api<any> {
    return avatar.connect(this.service.state, this.service.send, normalizeProps)
  }

  render = () => {
    const rootEl = this.rootEl
    spreadProps(this.rootEl, this.api.rootProps)
    const imageEl = rootEl.querySelector<HTMLElement>(".avatar-image")
    if (imageEl) spreadProps(imageEl, this.api.imageProps)
    const fallbackEl = rootEl.querySelector<HTMLElement>(".avatar-fallback")
    if (fallbackEl) spreadProps(fallbackEl, this.api.fallbackProps)
  }
}
