import * as dialog from "@zag-js/dialog"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.plugin(usePlugin("dialog-1", dialog))
Alpine.plugin(usePlugin("dialog-2", dialog))
Alpine.start()
