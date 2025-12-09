import * as angleSlider from "@zag-js/angle-slider"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.plugin(usePlugin("angle-slider", angleSlider))
Alpine.start()
