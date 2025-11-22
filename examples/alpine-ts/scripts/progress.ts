import * as progress from "@zag-js/progress"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.plugin(usePlugin("progress", progress))
Alpine.start()
