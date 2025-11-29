import * as passwordInput from "@zag-js/password-input"
import { Eye, EyeOff } from "lucide-static"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.magic("EyeIcon", () => Eye)
Alpine.magic("EyeOffIcon", () => EyeOff)
Alpine.plugin(usePlugin("password-input", passwordInput))
Alpine.start()
