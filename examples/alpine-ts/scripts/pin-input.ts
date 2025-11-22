import * as pinInput from "@zag-js/pin-input"
import serialize from "form-serialize"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.magic("serialize", () => serialize)
Alpine.plugin(usePlugin("pin-input", pinInput))
Alpine.start()
