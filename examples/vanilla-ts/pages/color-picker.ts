import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/color-picker.module.css"
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
