import { tourControls, tourData } from "@zag-js/shared"
import * as tour from "@zag-js/tour"
import Alpine from "alpinejs"
import { useControls } from "./use-controls"
import { usePlugin } from "../lib"

Alpine.magic("tourData", () => tourData)
Alpine.data("tour", useControls(tourControls))
Alpine.plugin(usePlugin("tour", tour))
Alpine.start()
