import * as checkbox from "@zag-js/checkbox"
import { normalizeProps } from "./normalize-props"
import { spreadProps } from "./spread-props"

export class Checkbox {
  rootEl: HTMLElement
  service: ReturnType<typeof checkbox.machine>
  api: checkbox.Api<any>

  constructor(rootEl: HTMLElement | null, context: checkbox.Context) {
    if (!rootEl) throw new Error("Root element not found")
    this.rootEl = rootEl

    this.service = checkbox.machine(context)
    this.api = checkbox.connect(this.service.state, this.service.send, normalizeProps)
  }

  init = () => {
    const { service } = this
    this.render()
    this.service.subscribe(() => {
      this.api = checkbox.connect(service.state, service.send, normalizeProps)
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

    const controlEl = rootEl.querySelector<HTMLElement>(".checkbox-control")
    if (controlEl) spreadProps(controlEl, this.api.controlProps)

    const labelEl = rootEl.querySelector<HTMLElement>(".checkbox-label")
    if (labelEl) spreadProps(labelEl, this.api.labelProps)

    const inputEl = rootEl.querySelector<HTMLInputElement>(".checkbox-input")
    if (inputEl) spreadProps(inputEl, this.api.hiddenInputProps)
  }
}
