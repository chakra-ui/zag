import "@zag-js/shared/src/style.css"

import Alpine from "alpinejs"
import * as popover from "@zag-js/popover"
import { createZagPlugin } from "../src/plugin"

Alpine.plugin(createZagPlugin("popover", popover))
// @ts-ignore
window.Alpine = Alpine
// @ts-ignore
window.Alpine.start()
