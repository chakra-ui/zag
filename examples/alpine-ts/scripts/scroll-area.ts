import * as scrollArea from "@zag-js/scroll-area"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.plugin(usePlugin("scroll-area", scrollArea))
Alpine.start()
