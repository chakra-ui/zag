import "@zag-js/shared/src/style.css"

import Alpine from "alpinejs"
import * as combobox from "@zag-js/combobox"
import { createZagPlugin } from "../src/plugin"

Alpine.plugin(createZagPlugin("combobox", combobox))
// @ts-ignore
window.Alpine = Alpine
// @ts-ignore
window.Alpine.start()
