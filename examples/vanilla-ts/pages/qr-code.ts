import "@zag-js/shared/src/style.css"

import { nanoid } from "nanoid"
import { QrCode } from "../src/qr-code"

document.querySelectorAll<HTMLElement>(".qr-code").forEach((rootEl) => {
  const qrCode = new QrCode(rootEl, {
    id: nanoid(),
    value: "https://zagjs.com",
  })

  qrCode.init()
})
