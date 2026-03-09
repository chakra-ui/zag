import * as slider from "@zag-js/slider"
import { sliderControls } from "@zag-js/shared"
import serialize from "form-serialize"
import Alpine from "alpinejs"
import { useData, usePlugin } from "../lib"

Alpine.magic("serialize", () => serialize)
Alpine.data("slider", useData(sliderControls))
Alpine.plugin(usePlugin("slider", slider))
Alpine.start()
