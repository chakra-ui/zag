import * as pagination from "@zag-js/pagination"
import { paginationControls, paginationData } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useData, usePlugin } from "../lib"

Alpine.magic("paginationData", () => paginationData)
Alpine.data("pagination", useData(paginationControls))
Alpine.plugin(usePlugin("pagination", pagination))
Alpine.start()
