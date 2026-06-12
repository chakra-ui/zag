import * as datePicker from "@zag-js/date-picker"
import { datePickerControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useControls, usePlugin } from "../lib"

Alpine.magic("parse", () => datePicker.parse)
Alpine.data("datePicker", useControls(datePickerControls))
Alpine.plugin(usePlugin("date-picker", datePicker))
Alpine.start()
