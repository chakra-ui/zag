import * as colorPicker from "@zag-js/color-picker"
import { colorPickerControls } from "@zag-js/shared"
import serialize from "form-serialize"
import Alpine from "alpinejs"
import { useData, usePlugin } from "../lib"

Alpine.magic("serialize", () => serialize)
Alpine.magic("parse", () => colorPicker.parse)
Alpine.data("colorPicker", useData(colorPickerControls))
Alpine.plugin(usePlugin("color-picker", colorPicker))
Alpine.start()
