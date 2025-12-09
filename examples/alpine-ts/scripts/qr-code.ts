import * as qrCode from "@zag-js/qr-code"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.plugin(usePlugin("qr-code", qrCode))
Alpine.start()
