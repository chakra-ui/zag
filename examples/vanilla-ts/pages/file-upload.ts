import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/file-upload.module.css"

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
