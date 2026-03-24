import * as listbox from "@zag-js/listbox"
import { listboxControls, selectData } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useControls, usePlugin } from "../lib"

const items = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "Solid", value: "solid" },
]

Alpine.magic("items", () => items)
Alpine.magic("selectData", () => selectData)
Alpine.data("listbox", useControls(listboxControls))
Alpine.plugin(usePlugin("listbox", listbox))
Alpine.start()
