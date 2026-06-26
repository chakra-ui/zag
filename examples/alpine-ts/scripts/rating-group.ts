import * as rating from "@zag-js/rating-group"
import { ratingControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useControls } from "./use-controls"
import { usePlugin } from "../lib"

Alpine.data("rating", useControls(ratingControls))
Alpine.plugin(usePlugin("rating", rating))
Alpine.start()
