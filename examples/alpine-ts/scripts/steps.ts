import { stepsControls, stepsData } from "@zag-js/shared"
import * as steps from "@zag-js/steps"
import Alpine from "alpinejs"
import { usePlugin } from "../lib"
import { useControls } from "./use-controls"

Alpine.data("steps", useControls(stepsControls))
Alpine.magic("stepsData", () => stepsData)
Alpine.plugin(usePlugin("steps", steps))
Alpine.start()
