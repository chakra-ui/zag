import * as colorPicker from "@zag-js/color-picker"
import { Component } from "./component"
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla"

const presets = ["#f47373", "#697689", "#38a169", "#3182ce"]

export class ColorPicker extends Component<colorPicker.Props, colorPicker.Api> {
  initMachine(props: colorPicker.Props) {
    return new VanillaMachine(colorPicker.machine, {
      ...props,
    })
  }

  initApi() {
    return colorPicker.connect(this.machine.service, normalizeProps)
  }

  private syncSwatches = () => {
    const swatchGroup = this.rootEl.querySelector<HTMLElement>(".color-picker-swatch-group")
    if (!swatchGroup) return

    const existingSwatches = Array.from(swatchGroup.querySelectorAll<HTMLElement>(".color-picker-swatch-trigger"))

    // Remove excess swatches
    while (existingSwatches.length > presets.length) {
      const swatch = existingSwatches.pop()
      if (swatch) swatchGroup.removeChild(swatch)
    }

    // Update or create swatches
    presets.forEach((preset, index) => {
      let triggerEl = existingSwatches[index]

      if (!triggerEl) {
        triggerEl = this.doc.createElement("button")
        triggerEl.className = "color-picker-swatch-trigger"

        const swatchEl = this.doc.createElement("div")
        swatchEl.className = "color-picker-swatch"
        triggerEl.appendChild(swatchEl)

        swatchGroup.appendChild(triggerEl)
      }

      this.spreadProps(triggerEl, this.api.getSwatchTriggerProps({ value: preset }))

      const swatchEl = triggerEl.querySelector<HTMLElement>(".color-picker-swatch")
      if (swatchEl) {
        this.spreadProps(swatchEl, this.api.getSwatchProps({ value: preset }))
      }
    })
  }

  render() {
    const hiddenInput = this.rootEl.querySelector<HTMLInputElement>(".color-picker-hidden-input")
    if (hiddenInput) this.spreadProps(hiddenInput, this.api.getHiddenInputProps())

    const root = this.rootEl.querySelector<HTMLElement>(".color-picker-root")
    if (root) this.spreadProps(root, this.api.getRootProps())

    const label = this.rootEl.querySelector<HTMLElement>(".color-picker-label")
    if (label) this.spreadProps(label, this.api.getLabelProps())

    const valueText = this.rootEl.querySelector<HTMLElement>(".color-picker-value-text")
    if (valueText) valueText.textContent = this.api.valueAsString

    const control = this.rootEl.querySelector<HTMLElement>(".color-picker-control")
    if (control) this.spreadProps(control, this.api.getControlProps())

    const trigger = this.rootEl.querySelector<HTMLElement>(".color-picker-trigger")
    if (trigger) this.spreadProps(trigger, this.api.getTriggerProps())

    const triggerGrid = trigger?.querySelector<HTMLElement>(".color-picker-transparency-grid")
    if (triggerGrid) this.spreadProps(triggerGrid, this.api.getTransparencyGridProps({ size: "10px" }))

    const triggerSwatch = trigger?.querySelector<HTMLElement>(".color-picker-swatch")
    if (triggerSwatch) this.spreadProps(triggerSwatch, this.api.getSwatchProps({ value: this.api.value }))

    const hexInput = this.rootEl.querySelector<HTMLInputElement>(".color-picker-hex-input")
    if (hexInput) this.spreadProps(hexInput, this.api.getChannelInputProps({ channel: "hex" }))

    const alphaInput = this.rootEl.querySelector<HTMLInputElement>(".color-picker-alpha-input")
    if (alphaInput) this.spreadProps(alphaInput, this.api.getChannelInputProps({ channel: "alpha" }))

    const positioner = this.rootEl.querySelector<HTMLElement>(".color-picker-positioner")
    if (positioner) this.spreadProps(positioner, this.api.getPositionerProps())

    const content = this.rootEl.querySelector<HTMLElement>(".color-picker-content")
    if (content) this.spreadProps(content, this.api.getContentProps())

    // Color area
    const area = this.rootEl.querySelector<HTMLElement>(".color-picker-area")
    if (area) this.spreadProps(area, this.api.getAreaProps())

    const areaBg = this.rootEl.querySelector<HTMLElement>(".color-picker-area-bg")
    if (areaBg) this.spreadProps(areaBg, this.api.getAreaBackgroundProps())

    const areaThumb = this.rootEl.querySelector<HTMLElement>(".color-picker-area-thumb")
    if (areaThumb) this.spreadProps(areaThumb, this.api.getAreaThumbProps())

    // Hue slider
    const hueSlider = this.rootEl.querySelector<HTMLElement>(".color-picker-hue-slider")
    if (hueSlider) this.spreadProps(hueSlider, this.api.getChannelSliderProps({ channel: "hue" }))

    const hueTrack = this.rootEl.querySelector<HTMLElement>(".color-picker-hue-track")
    if (hueTrack) this.spreadProps(hueTrack, this.api.getChannelSliderTrackProps({ channel: "hue" }))

    const hueThumb = this.rootEl.querySelector<HTMLElement>(".color-picker-hue-thumb")
    if (hueThumb) this.spreadProps(hueThumb, this.api.getChannelSliderThumbProps({ channel: "hue" }))

    // Alpha slider
    const alphaSlider = this.rootEl.querySelector<HTMLElement>(".color-picker-alpha-slider")
    if (alphaSlider) this.spreadProps(alphaSlider, this.api.getChannelSliderProps({ channel: "alpha" }))

    const alphaGrid = this.rootEl.querySelector<HTMLElement>(".color-picker-alpha-grid")
    if (alphaGrid) this.spreadProps(alphaGrid, this.api.getTransparencyGridProps({ size: "12px" }))

    const alphaTrack = this.rootEl.querySelector<HTMLElement>(".color-picker-alpha-track")
    if (alphaTrack) this.spreadProps(alphaTrack, this.api.getChannelSliderTrackProps({ channel: "alpha" }))

    const alphaThumb = this.rootEl.querySelector<HTMLElement>(".color-picker-alpha-thumb")
    if (alphaThumb) this.spreadProps(alphaThumb, this.api.getChannelSliderThumbProps({ channel: "alpha" }))

    // Channel inputs
    const hueInput = this.rootEl.querySelector<HTMLInputElement>(".color-picker-hue-input")
    if (hueInput) this.spreadProps(hueInput, this.api.getChannelInputProps({ channel: "hue" }))

    const saturationInput = this.rootEl.querySelector<HTMLInputElement>(".color-picker-saturation-input")
    if (saturationInput) this.spreadProps(saturationInput, this.api.getChannelInputProps({ channel: "saturation" }))

    const lightnessInput = this.rootEl.querySelector<HTMLInputElement>(".color-picker-lightness-input")
    if (lightnessInput) this.spreadProps(lightnessInput, this.api.getChannelInputProps({ channel: "lightness" }))

    const channelAlphaInput = this.rootEl.querySelector<HTMLInputElement>(".color-picker-channel-alpha-input")
    if (channelAlphaInput) this.spreadProps(channelAlphaInput, this.api.getChannelInputProps({ channel: "alpha" }))

    // Preview swatch
    const previewGrid = this.rootEl.querySelector<HTMLElement>(".color-picker-preview-grid")
    if (previewGrid) this.spreadProps(previewGrid, this.api.getTransparencyGridProps({ size: "4px" }))

    const previewSwatch = this.rootEl.querySelector<HTMLElement>(".color-picker-preview-swatch")
    if (previewSwatch) this.spreadProps(previewSwatch, this.api.getSwatchProps({ value: this.api.value }))

    const previewValue = this.rootEl.querySelector<HTMLElement>(".color-picker-preview-value")
    if (previewValue) previewValue.textContent = this.api.valueAsString

    // Hex input in content
    const contentHexInput = this.rootEl.querySelector<HTMLInputElement>(".color-picker-content-hex-input")
    if (contentHexInput) this.spreadProps(contentHexInput, this.api.getChannelInputProps({ channel: "hex" }))

    // Swatch group
    const swatchGroup = this.rootEl.querySelector<HTMLElement>(".color-picker-swatch-group")
    if (swatchGroup) this.spreadProps(swatchGroup, this.api.getSwatchGroupProps())

    this.syncSwatches()

    // Eye dropper
    const eyeDropper = this.rootEl.querySelector<HTMLElement>(".color-picker-eye-dropper")
    if (eyeDropper) this.spreadProps(eyeDropper, this.api.getEyeDropperTriggerProps())
  }
}
