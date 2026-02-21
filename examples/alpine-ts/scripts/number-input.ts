import * as numberInput from "@zag-js/number-input"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.plugin(usePlugin("number-input", numberInput))
Alpine.start()
