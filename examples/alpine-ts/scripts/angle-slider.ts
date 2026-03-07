import * as angleSlider from "@zag-js/angle-slider"
import { angleSliderControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useData, usePlugin } from "../lib"

Alpine.data("angleSlider", useData(angleSliderControls))
Alpine.plugin(usePlugin("angle-slider", angleSlider))
Alpine.start()
