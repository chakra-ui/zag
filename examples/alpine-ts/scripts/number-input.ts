import * as numberInput from "@zag-js/number-input"
import { numberInputControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useData, usePlugin } from "../lib"

Alpine.data("numberInput", useData(numberInputControls))
Alpine.plugin(usePlugin("number-input", numberInput))
Alpine.start()
