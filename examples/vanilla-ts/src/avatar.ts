import * as avatar from "@zag-js/avatar"
import { normalizeProps } from "./normalize-props"
import { spreadProps } from "./spread-props"

export class Avatar {
  rootEl: HTMLElement
  service: ReturnType<typeof avatar.machine>
  api: avatar.Api<any>

  constructor(rootEl: HTMLElement | null, context: avatar.Context) {
    if (!rootEl) throw new Error("Root element not found")
    this.rootEl = rootEl

    this.service = avatar.machine(context)
    this.api = avatar.connect(this.service.state, this.service.send, normalizeProps)
  }

  init = () => {
    const { service } = this
    this.render()
    this.service.subscribe(() => {
      this.api = avatar.connect(service.state, service.send, normalizeProps)
      this.render()
    })

    this.service.start()
  }

  destroy = () => {
    this.service.stop()
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
