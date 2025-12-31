import * as colorPicker from "@zag-js/color-picker"
import serialize from "form-serialize"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.magic("serialize", () => serialize)
Alpine.magic("parse", () => colorPicker.parse)
Alpine.plugin(usePlugin("color-picker", colorPicker))
Alpine.start()
