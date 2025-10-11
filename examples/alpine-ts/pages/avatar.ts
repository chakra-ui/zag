import "@zag-js/shared/src/style.css"

import Alpine from "alpinejs"
import * as avatar from "@zag-js/avatar"
import { createZagPlugin } from "../src/plugin"

Alpine.plugin(createZagPlugin("avatar", avatar))
// @ts-ignore
window.Alpine = Alpine
// @ts-ignore
window.Alpine.start()
