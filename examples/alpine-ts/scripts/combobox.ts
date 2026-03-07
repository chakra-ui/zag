import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { comboboxData } from "@zag-js/shared"
import Alpine from "alpinejs"
import { usePlugin } from "../lib"

Alpine.magic("contains", () => createFilter({ sensitivity: "base" }).contains)
Alpine.magic("comboboxData", () => comboboxData)
Alpine.plugin(usePlugin("combobox", combobox))
Alpine.start()
