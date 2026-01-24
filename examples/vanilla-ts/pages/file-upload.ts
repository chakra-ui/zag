import "@zag-js/shared/src/style.css"

import { nanoid } from "nanoid"
import { FileUpload } from "../src/file-upload"

document.querySelectorAll<HTMLElement>(".file-upload").forEach((rootEl) => {
  const fileUpload = new FileUpload(rootEl, {
    id: nanoid(),
    maxFiles: 5,
    accept: "image/*",
  })

  fileUpload.init()
})
