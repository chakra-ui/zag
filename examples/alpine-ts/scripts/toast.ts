import * as dialog from "@zag-js/dialog"
import { toastControls } from "@zag-js/shared"
import * as toast from "@zag-js/toast"
import Alpine from "alpinejs"
import { useControls } from "./use-controls"
import { usePlugin } from "../lib"

const toasterOverlap = toast.createStore({
  overlap: true,
  placement: "bottom",
  gap: 24,
})
const toasterStacked = toast.createStore({
  overlap: false,
  placement: "bottom",
  gap: 24,
})

Alpine.magic("toasterOverlap", () => toasterOverlap)
Alpine.magic("toasterStacked", () => toasterStacked)
Alpine.data("toast", useControls(toastControls))
Alpine.plugin(usePlugin("dialog", dialog))
Alpine.plugin(usePlugin("toast-group", toast.group))
Alpine.plugin(usePlugin("toast-item", toast))
Alpine.start()
