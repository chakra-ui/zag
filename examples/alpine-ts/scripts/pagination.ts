import * as pagination from "@zag-js/pagination"
import { paginationData } from "@zag-js/shared"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.magic("paginationData", () => paginationData)
Alpine.plugin(usePlugin("pagination", pagination))
Alpine.start()
