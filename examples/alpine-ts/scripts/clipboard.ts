import * as clipboard from "@zag-js/clipboard"
import { clipboardControls } from "@zag-js/shared"
import { ClipboardCheck, ClipboardCopy } from "lucide-static"
import Alpine from "alpinejs"
import { useControls, usePlugin } from "../lib"

Alpine.magic("ClipboardCheck", () => ClipboardCheck)
Alpine.magic("ClipboardCopy", () => ClipboardCopy)
Alpine.data("clipboard", useControls(clipboardControls))
Alpine.plugin(usePlugin("clipboard", clipboard))
Alpine.start()
