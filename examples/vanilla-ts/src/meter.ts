import * as meter from "@zag-js/meter"
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla"
import { Component } from "./component"

export class Meter extends Component<meter.Props, meter.Api> {
  initMachine(props: meter.Props) {
    return new VanillaMachine(meter.machine, {
      ...props,
    })
  }

  initApi() {
    return meter.connect(this.machine.service, normalizeProps)
  }

  render() {
    this.spreadProps(this.rootEl, this.api.getRootProps())

    const label = this.rootEl.querySelector<HTMLElement>(".meter-label")
    if (label) this.spreadProps(label, this.api.getLabelProps())

    const track = this.rootEl.querySelector<HTMLElement>(".meter-track")
    if (track) this.spreadProps(track, this.api.getTrackProps())

    const indicator = this.rootEl.querySelector<HTMLElement>(".meter-indicator")
    if (indicator) this.spreadProps(indicator, this.api.getIndicatorProps())

    const valueText = this.rootEl.querySelector<HTMLElement>(".meter-value-text")
    if (valueText) {
      this.spreadProps(valueText, this.api.getValueTextProps())
      valueText.textContent = `${this.api.valueAsString} · ${this.api.valueState}`
    }
  }
}
