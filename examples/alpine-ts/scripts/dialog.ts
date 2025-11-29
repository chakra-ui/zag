import * as dialog from "@zag-js/dialog"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.plugin(usePlugin("dialog", dialog))
Alpine.start()
