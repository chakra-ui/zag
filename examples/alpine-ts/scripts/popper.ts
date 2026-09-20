import { getPlacement, getPlacementStyles } from "@zag-js/popper"
import Alpine from "alpinejs"

Alpine.magic("getPlacement", () => getPlacement)
Alpine.magic("getPlacementStyles", () => getPlacementStyles)
Alpine.start()
