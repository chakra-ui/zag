import * as timer from "@zag-js/timer"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.magic("parse", () => timer.parse)
Alpine.plugin(usePlugin("timer", timer))
Alpine.start()
