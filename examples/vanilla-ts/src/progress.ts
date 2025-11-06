import * as progress from "@zag-js/progress"
import { Component } from "./component"
import { normalizeProps, spreadProps, VanillaMachine } from "./lib"

export class Progress extends Component<progress.Props, progress.Api> {
  initMachine(props: progress.Props) {
    return new VanillaMachine(progress.machine, {
      ...props,
    })
  }

  initApi() {
    return progress.connect(this.machine.service, normalizeProps)
  }

  render() {
    spreadProps(this.rootEl, this.api.getRootProps())

    const label = this.rootEl.querySelector<HTMLElement>(".progress-label")
    if (label) spreadProps(label, this.api.getLabelProps())

    const track = this.rootEl.querySelector<HTMLElement>(".progress-track")
    if (track) spreadProps(track, this.api.getTrackProps())

    const range = this.rootEl.querySelector<HTMLElement>(".progress-range")
    if (range) spreadProps(range, this.api.getRangeProps())

    const valueText = this.rootEl.querySelector<HTMLElement>(".progress-value-text")
    if (valueText) {
      spreadProps(valueText, this.api.getValueTextProps())
      valueText.textContent = this.api.valueAsString
    }

    const circle = this.rootEl.querySelector<SVGSVGElement>(".progress-circle")
    if (circle) spreadProps(circle, this.api.getCircleProps())

    const circleTrack = this.rootEl.querySelector<SVGCircleElement>(".progress-circle-track")
    if (circleTrack) spreadProps(circleTrack, this.api.getCircleTrackProps())

    const circleRange = this.rootEl.querySelector<SVGCircleElement>(".progress-circle-range")
    if (circleRange) spreadProps(circleRange, this.api.getCircleRangeProps())
  }
}
