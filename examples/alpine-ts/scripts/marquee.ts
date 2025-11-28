import * as marquee from "@zag-js/marquee"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.plugin(usePlugin("marquee", marquee))
Alpine.start()
