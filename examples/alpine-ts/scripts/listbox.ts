import * as listbox from "@zag-js/listbox"
import { selectData } from "@zag-js/shared"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.magic("selectData", () => selectData)
Alpine.plugin(usePlugin("listbox", listbox))
Alpine.start()
