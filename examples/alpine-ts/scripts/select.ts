import * as select from "@zag-js/select"
import { selectControls, selectData } from "@zag-js/shared"
import serialize from "form-serialize"
import Alpine from "alpinejs"
import { useControls, usePlugin } from "../lib"

const items = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "Solid", value: "solid" },
]

Alpine.magic("items", () => items)
Alpine.magic("serialize", () => serialize)
Alpine.magic("selectData", () => selectData)
Alpine.data("select", useControls(selectControls))
Alpine.plugin(usePlugin("select", select))
Alpine.start()
