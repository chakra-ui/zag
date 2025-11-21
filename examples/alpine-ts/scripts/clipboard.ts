import * as clipboard from "@zag-js/clipboard"
import { ClipboardCheck, ClipboardCopy } from "lucide-static"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.magic("ClipboardCheck", () => ClipboardCheck)
Alpine.magic("ClipboardCopy", () => ClipboardCopy)
Alpine.plugin(usePlugin("clipboard", clipboard))
Alpine.start()
