import * as checkbox from "@zag-js/checkbox"
import serialize from "form-serialize"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.magic("serialize", () => serialize)
Alpine.plugin(usePlugin("checkbox", checkbox))
Alpine.start()
