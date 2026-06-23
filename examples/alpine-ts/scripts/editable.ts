import * as editable from "@zag-js/editable"
import { editableControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useControls, usePlugin } from "../lib"

Alpine.data("editable", useControls(editableControls))
Alpine.plugin(usePlugin("editable", editable))
Alpine.start()
