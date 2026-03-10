import * as passwordInput from "@zag-js/password-input"
import { passwordInputControls } from "@zag-js/shared"
import { Eye, EyeOff } from "lucide-static"
import Alpine from "alpinejs"
import { useControls, usePlugin } from "../lib"

Alpine.magic("EyeIcon", () => Eye)
Alpine.magic("EyeOffIcon", () => EyeOff)
Alpine.data("passwordInput", useControls(passwordInputControls))
Alpine.plugin(usePlugin("password-input", passwordInput))
Alpine.start()
