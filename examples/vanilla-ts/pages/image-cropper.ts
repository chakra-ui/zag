import "@zag-js/shared/src/style.css"

import { nanoid } from "nanoid"
import { ImageCropper } from "../src/image-cropper"

document.querySelectorAll<HTMLElement>(".image-cropper-root").forEach((rootEl) => {
  const imageCropper = new ImageCropper(rootEl, {
    id: nanoid(),
  })

  imageCropper.init()

  // Control buttons
  const container = rootEl.closest(".image-cropper")
  if (!container) return

  const zoomInBtn = container.querySelector<HTMLButtonElement>(".image-cropper-zoom-in-btn")
  const zoomOutBtn = container.querySelector<HTMLButtonElement>(".image-cropper-zoom-out-btn")
  const rotateLeftBtn = container.querySelector<HTMLButtonElement>(".image-cropper-rotate-left-btn")
  const rotateRightBtn = container.querySelector<HTMLButtonElement>(".image-cropper-rotate-right-btn")
  const flipHBtn = container.querySelector<HTMLButtonElement>(".image-cropper-flip-h-btn")
  const flipVBtn = container.querySelector<HTMLButtonElement>(".image-cropper-flip-v-btn")
  const resetBtn = container.querySelector<HTMLButtonElement>(".image-cropper-reset-btn")
  const getImageBtn = container.querySelector<HTMLButtonElement>(".image-cropper-get-image-btn")
  const previewCanvas = container.querySelector<HTMLCanvasElement>(".image-cropper-preview-canvas")

  if (zoomInBtn) {
    zoomInBtn.addEventListener("click", () => {
      imageCropper.api.zoomBy(0.1)
    })
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", () => {
      imageCropper.api.zoomBy(-0.1)
    })
  }

  if (rotateLeftBtn) {
    rotateLeftBtn.addEventListener("click", () => {
      imageCropper.api.rotateBy(-90)
    })
  }

  if (rotateRightBtn) {
    rotateRightBtn.addEventListener("click", () => {
      imageCropper.api.rotateBy(90)
    })
  }

  if (flipHBtn) {
    flipHBtn.addEventListener("click", () => {
      imageCropper.api.flipHorizontally()
    })
  }

  if (flipVBtn) {
    flipVBtn.addEventListener("click", () => {
      imageCropper.api.flipVertically()
    })
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      imageCropper.api.reset()
    })
  }

  if (getImageBtn && previewCanvas) {
    getImageBtn.addEventListener("click", async () => {
      const blob = await imageCropper.api.getCroppedImage({ output: "blob" })
      if (blob && blob instanceof Blob) {
        const url = URL.createObjectURL(blob)
        const img = new Image()
        img.onload = () => {
          previewCanvas.width = img.width
          previewCanvas.height = img.height
          const ctx = previewCanvas.getContext("2d")
          if (ctx) {
            ctx.drawImage(img, 0, 0)
          }
          URL.revokeObjectURL(url)
        }
        img.src = url
      }
    })
  }
})
