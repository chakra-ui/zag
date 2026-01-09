import * as angleSlider from "@zag-js/angle-slider"
import { Component } from "./component"
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla"

export class AngleSlider extends Component<angleSlider.Props, angleSlider.Api> {
  initMachine(props: angleSlider.Props) {
    return new VanillaMachine(angleSlider.machine, {
      ...props,
    })
  }

  initApi() {
    return angleSlider.connect(this.machine.service, normalizeProps)
  }

  syncMarkers = () => {
    const markerGroup = this.rootEl.querySelector<HTMLElement>(".angle-slider-marker-group")
    if (!markerGroup) return

    const markers = [0, 45, 90, 135, 180, 225, 270, 315]
    const existingMarkers = Array.from(markerGroup.querySelectorAll<HTMLElement>(".angle-slider-marker"))

    // Remove excess markers
    while (existingMarkers.length > markers.length) {
      const marker = existingMarkers.pop()
      if (marker) markerGroup.removeChild(marker)
    }

    // Update or create markers
    markers.forEach((value, index) => {
      let markerEl = existingMarkers[index]

      if (!markerEl) {
        markerEl = this.doc.createElement("div")
        markerEl.className = "angle-slider-marker"
        markerGroup.appendChild(markerEl)
      }

      this.spreadProps(markerEl, this.api.getMarkerProps({ value }))
    })
  }

  render() {
    this.spreadProps(this.rootEl, this.api.getRootProps())

    const label = this.rootEl.querySelector<HTMLElement>(".angle-slider-label")
    if (label) this.spreadProps(label, this.api.getLabelProps())

    const valueText = this.rootEl.querySelector<HTMLElement>(".angle-slider-value-text")
    if (valueText) {
      this.spreadProps(valueText, this.api.getValueTextProps())
      valueText.textContent = this.api.valueAsDegree
    }

    const control = this.rootEl.querySelector<HTMLElement>(".angle-slider-control")
    if (control) this.spreadProps(control, this.api.getControlProps())

    const thumb = this.rootEl.querySelector<HTMLElement>(".angle-slider-thumb")
    if (thumb) this.spreadProps(thumb, this.api.getThumbProps())

    const markerGroup = this.rootEl.querySelector<HTMLElement>(".angle-slider-marker-group")
    if (markerGroup) this.spreadProps(markerGroup, this.api.getMarkerGroupProps())

    const hiddenInput = this.rootEl.querySelector<HTMLInputElement>(".angle-slider-hidden-input")
    if (hiddenInput) this.spreadProps(hiddenInput, this.api.getHiddenInputProps())

    // Sync markers
    this.syncMarkers()
  }
}
