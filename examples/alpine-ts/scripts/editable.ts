import * as editable from "@zag-js/editable"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.plugin(usePlugin("editable", editable))
Alpine.start()
