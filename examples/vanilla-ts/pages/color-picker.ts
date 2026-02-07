import "@zag-js/shared/src/style.css"
import * as colorPicker from "@zag-js/color-picker"

import { nanoid } from "nanoid"
import { ColorPicker } from "../src/color-picker"

document.querySelectorAll<HTMLElement>(".color-picker").forEach((rootEl) => {
  const picker = new ColorPicker(rootEl, {
    id: nanoid(),
    name: "color",
    format: "hsla",
    defaultValue: colorPicker.parse("hsl(0, 100%, 50%)"),
  })

  picker.init()
})
