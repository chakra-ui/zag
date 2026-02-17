import * as asyncList from "@zag-js/async-list"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.plugin(usePlugin("async-list", asyncList))
Alpine.start()
