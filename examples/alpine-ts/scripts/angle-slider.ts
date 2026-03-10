import * as angleSlider from "@zag-js/angle-slider"
import { angleSliderControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useControls, usePlugin } from "../lib"

Alpine.data("angleSlider", useControls(angleSliderControls))
Alpine.plugin(usePlugin("angle-slider", angleSlider))
Alpine.start()
