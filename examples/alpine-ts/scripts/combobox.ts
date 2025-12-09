import * as combobox from "@zag-js/combobox"
import { comboboxData } from "@zag-js/shared"
import { matchSorter } from "match-sorter"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.magic("matchSorter", () => matchSorter)
Alpine.magic("comboboxData", () => comboboxData)
Alpine.plugin(usePlugin("combobox", combobox))
Alpine.start()
