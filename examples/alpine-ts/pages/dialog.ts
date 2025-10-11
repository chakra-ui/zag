import "@zag-js/shared/src/style.css"

import Alpine from "alpinejs"
import * as dialog from "@zag-js/dialog"
import { createZagPlugin } from "../src/plugin"

Alpine.plugin(createZagPlugin("dialog", dialog))
// @ts-ignore
window.Alpine = Alpine
// @ts-ignore
window.Alpine.start()
