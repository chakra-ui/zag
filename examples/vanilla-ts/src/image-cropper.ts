import * as imageCropper from "@zag-js/image-cropper"
import { Component } from "./component"
import { normalizeProps, spreadProps, VanillaMachine } from "@zag-js/vanilla"

export class ImageCropper extends Component<imageCropper.Props, imageCropper.Api> {
  initMachine(props: imageCropper.Props) {
    return new VanillaMachine(imageCropper.machine, {
      ...props,
    })
  }

  initApi() {
    return imageCropper.connect(this.machine.service, normalizeProps)
  }

  syncHandles = () => {
    const selection = this.rootEl.querySelector<HTMLElement>(".image-cropper-selection")
    if (!selection) return

    const existingHandles = Array.from(selection.querySelectorAll<HTMLElement>(".image-cropper-handle"))

    // Remove excess handles
    while (existingHandles.length > imageCropper.handles.length) {
      const handle = existingHandles.pop()
      if (handle) selection.removeChild(handle)
    }

    // Update or create handles
    imageCropper.handles.forEach((position, index) => {
      let handleEl = existingHandles[index]

      if (!handleEl) {
        handleEl = this.doc.createElement("div")
        handleEl.className = "image-cropper-handle"
        handleEl.setAttribute("data-position", position)

        // Add inner div for styling
        const innerDiv = this.doc.createElement("div")
        handleEl.appendChild(innerDiv)

        selection.appendChild(handleEl)
      }

      spreadProps(handleEl, this.api.getHandleProps({ position }))
    })
  }

  syncGridLines = () => {
    const selection = this.rootEl.querySelector<HTMLElement>(".image-cropper-selection")
    if (!selection) return

    // Horizontal grid
    let horizontalGrid = selection.querySelector<HTMLElement>(".image-cropper-grid-horizontal")
    if (!horizontalGrid) {
      horizontalGrid = this.doc.createElement("div")
      horizontalGrid.className = "image-cropper-grid-horizontal"
      selection.appendChild(horizontalGrid)
    }
    spreadProps(horizontalGrid, this.api.getGridProps({ axis: "horizontal" }))

    // Vertical grid
    let verticalGrid = selection.querySelector<HTMLElement>(".image-cropper-grid-vertical")
    if (!verticalGrid) {
      verticalGrid = this.doc.createElement("div")
      verticalGrid.className = "image-cropper-grid-vertical"
      selection.appendChild(verticalGrid)
    }
    spreadProps(verticalGrid, this.api.getGridProps({ axis: "vertical" }))
  }

  render() {
    spreadProps(this.rootEl, this.api.getRootProps())

    const viewport = this.rootEl.querySelector<HTMLElement>(".image-cropper-viewport")
    if (viewport) spreadProps(viewport, this.api.getViewportProps())

    const image = this.rootEl.querySelector<HTMLElement>(".image-cropper-image")
    if (image) spreadProps(image, this.api.getImageProps())

    const selection = this.rootEl.querySelector<HTMLElement>(".image-cropper-selection")
    if (selection) spreadProps(selection, this.api.getSelectionProps())

    // Sync handles and grid
    this.syncHandles()
    this.syncGridLines()
  }
}
