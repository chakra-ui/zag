import "@zag-js/shared/src/style.css"

import { nanoid } from "nanoid"
import { SignaturePad } from "../src/signature-pad"

document.querySelectorAll<HTMLElement>(".signature-pad-root").forEach((rootEl) => {
  const signaturePad = new SignaturePad(rootEl, {
    id: nanoid(),
    onDrawEnd(details) {
      details.getDataUrl("image/png").then((url) => {
        const preview = document.querySelector<HTMLImageElement>(".signature-pad-preview")
        if (preview && url) {
          preview.src = url
          preview.style.display = "block"
        }
      })
    },
  })

  signaturePad.init()

  // Show image button
  const showImageBtn = document.querySelector<HTMLElement>(".signature-pad-show-image")
  if (showImageBtn) {
    showImageBtn.onclick = () => {
      if (signaturePad.api.empty) {
        const preview = document.querySelector<HTMLImageElement>(".signature-pad-preview")
        if (preview) {
          preview.style.display = "none"
        }
        return
      }

      signaturePad.api.getDataUrl("image/png").then((url) => {
        const preview = document.querySelector<HTMLImageElement>(".signature-pad-preview")
        if (preview && url) {
          preview.src = url
          preview.style.display = "block"
        }
      })
    }
  }

  // Listen to clear button to hide preview
  const clearBtn = rootEl.querySelector<HTMLElement>(".signature-pad-clear")
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      const preview = document.querySelector<HTMLImageElement>(".signature-pad-preview")
      if (preview) {
        preview.style.display = "none"
        preview.src = ""
      }
    })
  }
})
