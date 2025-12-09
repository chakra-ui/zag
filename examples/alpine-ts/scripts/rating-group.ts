import * as rating from "@zag-js/rating-group"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.plugin(usePlugin("rating", rating))
Alpine.start()
