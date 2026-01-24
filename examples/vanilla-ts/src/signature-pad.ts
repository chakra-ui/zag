import * as signaturePad from "@zag-js/signature-pad"
import { Component } from "./component"
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla"

export class SignaturePad extends Component<signaturePad.Props, signaturePad.Api> {
  initMachine(props: signaturePad.Props) {
    return new VanillaMachine(signaturePad.machine, {
      drawing: {
        fill: "red",
        size: 4,
        simulatePressure: true,
      },
      ...props,
    })
  }

  initApi() {
    return signaturePad.connect(this.machine.service, normalizeProps)
  }

  syncPaths = () => {
    const segment = this.rootEl.querySelector<SVGSVGElement>(".signature-pad-segment")
    if (!segment) return

    const existingPaths = Array.from(segment.querySelectorAll<SVGPathElement>(".signature-pad-path"))

    // Remove excess paths
    while (existingPaths.length > this.api.paths.length + (this.api.currentPath ? 1 : 0)) {
      const path = existingPaths.pop()
      if (path) segment.removeChild(path)
    }

    // Update or create paths
    this.api.paths.forEach((pathData, index) => {
      let pathEl = existingPaths[index]

      if (!pathEl) {
        pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path")
        pathEl.classList.add("signature-pad-path")
        segment.appendChild(pathEl)
      }

      this.spreadProps(pathEl, this.api.getSegmentPathProps({ path: pathData }))
    })

    // Handle current path
    if (this.api.currentPath) {
      let currentPathEl = existingPaths[this.api.paths.length]

      if (!currentPathEl) {
        currentPathEl = document.createElementNS("http://www.w3.org/2000/svg", "path")
        currentPathEl.classList.add("signature-pad-path")
        currentPathEl.classList.add("signature-pad-current-path")
        segment.appendChild(currentPathEl)
      }

      this.spreadProps(currentPathEl, this.api.getSegmentPathProps({ path: this.api.currentPath }))
    } else {
      // Remove current path element if it exists but there's no current path
      const currentPathEl = segment.querySelector(".signature-pad-current-path")
      if (currentPathEl) segment.removeChild(currentPathEl)
    }
  }

  render() {
    this.spreadProps(this.rootEl, this.api.getRootProps())

    const label = this.rootEl.querySelector<HTMLElement>(".signature-pad-label")
    if (label) this.spreadProps(label, this.api.getLabelProps())

    const control = this.rootEl.querySelector<HTMLElement>(".signature-pad-control")
    if (control) this.spreadProps(control, this.api.getControlProps())

    const segment = this.rootEl.querySelector<SVGSVGElement>(".signature-pad-segment")
    if (segment) this.spreadProps(segment, this.api.getSegmentProps())

    const guide = this.rootEl.querySelector<HTMLElement>(".signature-pad-guide")
    if (guide) this.spreadProps(guide, this.api.getGuideProps())

    const clearBtn = this.rootEl.querySelector<HTMLElement>(".signature-pad-clear")
    if (clearBtn) this.spreadProps(clearBtn, this.api.getClearTriggerProps())

    const hiddenInput = this.rootEl.querySelector<HTMLInputElement>(".signature-pad-hidden-input")
    if (hiddenInput) {
      this.api.getDataUrl("image/png").then((url) => {
        this.spreadProps(hiddenInput, this.api.getHiddenInputProps({ value: url }))
      })
    }

    // Sync paths
    this.syncPaths()
  }
}
