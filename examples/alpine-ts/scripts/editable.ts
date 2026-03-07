import * as editable from "@zag-js/editable"
import { editableControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useData, usePlugin } from "../lib"

Alpine.data("editable", useData(editableControls))
Alpine.plugin(usePlugin("editable", editable))
Alpine.start()
