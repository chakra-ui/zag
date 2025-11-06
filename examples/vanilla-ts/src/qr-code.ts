import * as qrCode from "@zag-js/qr-code"
import { Component } from "./component"
import { normalizeProps, spreadProps, VanillaMachine } from "./lib"

export class QrCode extends Component<qrCode.Props, qrCode.Api> {
  initMachine(props: qrCode.Props) {
    return new VanillaMachine(qrCode.machine, {
      ...props,
    })
  }

  initApi() {
    return qrCode.connect(this.machine.service, normalizeProps)
  }

  render() {
    spreadProps(this.rootEl, this.api.getRootProps())

    const frame = this.rootEl.querySelector<HTMLElement>(".qr-code-frame")
    if (frame) spreadProps(frame, this.api.getFrameProps())

    const pattern = this.rootEl.querySelector<HTMLElement>(".qr-code-pattern")
    if (pattern) spreadProps(pattern, this.api.getPatternProps())
  }
}
