import * as marquee from "@zag-js/marquee"
import { marqueeControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { usePlugin } from "../lib"
import { useControls } from "./use-controls"

Alpine.data("marquee", useControls(marqueeControls))
Alpine.plugin(usePlugin("marquee", marquee))
Alpine.start()
