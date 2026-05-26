import * as slider from "@zag-js/slider"
import { sliderControls } from "@zag-js/shared"
import serialize from "form-serialize"
import Alpine from "alpinejs"
import { useControls, usePlugin } from "../lib"

Alpine.magic("serialize", () => serialize)
Alpine.data("slider", useControls(sliderControls))
Alpine.plugin(usePlugin("slider", slider))
Alpine.start()
