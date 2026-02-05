import "@zag-js/shared/src/style.css"

import { nanoid } from "nanoid"
import { DatePicker } from "../src/date-picker"

document.querySelectorAll<HTMLElement>(".date-picker").forEach((rootEl) => {
  const datePicker = new DatePicker(rootEl, {
    id: nanoid(),
    locale: "en",
    selectionMode: "single",
  })

  datePicker.init()
})
