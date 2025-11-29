import * as steps from "@zag-js/steps"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.plugin(usePlugin("steps", steps))
Alpine.start()
