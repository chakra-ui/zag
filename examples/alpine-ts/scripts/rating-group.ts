import * as rating from "@zag-js/rating-group"
import { ratingControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useData, usePlugin } from "../lib"

Alpine.data("rating", useData(ratingControls))
Alpine.plugin(usePlugin("rating", rating))
Alpine.start()
