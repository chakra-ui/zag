import * as slider from "@zag-js/slider"
import { Component } from "./component"
import { normalizeProps, spreadProps, VanillaMachine } from "@zag-js/vanilla"

export class Slider extends Component<slider.Props, slider.Api> {
  initMachine(props: slider.Props) {
    return new VanillaMachine(slider.machine, {
      ...props,
    })
  }

  initApi() {
    return slider.connect(this.machine.service, normalizeProps)
  }

  render() {
    spreadProps(this.rootEl, this.api.getRootProps())

    const label = this.rootEl.querySelector<HTMLElement>(".slider-label")
    if (label) spreadProps(label, this.api.getLabelProps())

    const control = this.rootEl.querySelector<HTMLElement>(".slider-control")
    if (control) spreadProps(control, this.api.getControlProps())

    const track = this.rootEl.querySelector<HTMLElement>(".slider-track")
    if (track) spreadProps(track, this.api.getTrackProps())

    const range = this.rootEl.querySelector<HTMLElement>(".slider-range")
    if (range) spreadProps(range, this.api.getRangeProps())

    const thumb = this.rootEl.querySelector<HTMLElement>(".slider-thumb")
    if (thumb) {
      spreadProps(thumb, this.api.getThumbProps({ index: 0 }))
      const input = thumb.querySelector<HTMLInputElement>("input")
      if (input) spreadProps(input, this.api.getHiddenInputProps({ index: 0 }))
    }

    const output = this.rootEl.querySelector<HTMLElement>(".slider-output")
    if (output) {
      spreadProps(output, this.api.getValueTextProps())
      output.textContent = this.api.value.join(", ")
    }
  }
}
