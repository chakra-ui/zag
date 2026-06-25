import { CalendarDate, parseZonedDateTime } from "@internationalized/date"
import * as dateInput from "@zag-js/date-input"
import { dateInputControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useControls, usePlugin } from "../lib"

Alpine.magic("CalendarDate", () => CalendarDate)
Alpine.magic("parseZonedDateTime", () => parseZonedDateTime)
Alpine.data("dateInput", useControls(dateInputControls))
Alpine.plugin(usePlugin("date-input", dateInput))
Alpine.start()
