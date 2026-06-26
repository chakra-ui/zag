import { qrCodeControls } from "@zag-js/shared"
import * as qrCode from "@zag-js/qr-code"
import Alpine from "alpinejs"
import { usePlugin } from "../lib"
import { useControls } from "./use-controls"

Alpine.data("qrCode", useControls(qrCodeControls))
Alpine.plugin(usePlugin("qr-code", qrCode))
Alpine.start()
