import * as numberInput from "@zag-js/number-input"
import { numberInputControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useControls, usePlugin } from "../lib"

Alpine.data("numberInput", useControls(numberInputControls))
Alpine.plugin(usePlugin("number-input", numberInput))
Alpine.start()
