import "@zag-js/shared/src/style.css"

import Alpine from "alpinejs"
import * as angleSlider from "@zag-js/angle-slider"
import { createZagPlugin } from "../src/plugin"

Alpine.plugin(createZagPlugin("angle-slider", angleSlider))
// @ts-ignore
window.Alpine = Alpine
// @ts-ignore
window.Alpine.start()
