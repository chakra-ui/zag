import { PersianCalendar } from "@internationalized/date"
import * as datePicker from "@zag-js/date-picker"
import { datePickerControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useControls } from "./use-controls"
import { usePlugin } from "../lib"

// Only bundle the Persian calendar — not all 13+ calendars.
function createCalendar(identifier: string) {
  switch (identifier) {
    case "persian":
      return new PersianCalendar()
    default:
      throw new Error(`Unsupported calendar: ${identifier}`)
  }
}

Alpine.magic("createCalendar", () => createCalendar)
Alpine.magic("parse", () => datePicker.parse)
Alpine.data("datePicker", useControls(datePickerControls))
Alpine.plugin(usePlugin("date-picker", datePicker))
Alpine.start()
