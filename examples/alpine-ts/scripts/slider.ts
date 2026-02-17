import * as slider from "@zag-js/slider"
import serialize from "form-serialize"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.magic("serialize", () => serialize)
Alpine.plugin(usePlugin("slider", slider))
Alpine.start()
