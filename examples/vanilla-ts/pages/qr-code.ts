import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/qr-code.module.css"

import { nanoid } from "nanoid"
import { QrCode } from "../src/qr-code"

document.querySelectorAll<HTMLElement>(".qr-code").forEach((rootEl) => {
  const qrCode = new QrCode(rootEl, {
    id: nanoid(),
    value: "https://zagjs.com",
  })

  qrCode.init()
})
