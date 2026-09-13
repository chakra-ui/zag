import * as dialog from "@zag-js/dialog"
import * as presence from "@zag-js/presence"
import Alpine from "alpinejs"
import { usePlugin } from "../lib"

const users = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "Admin" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", role: "Editor" },
  { id: 3, name: "Carol Davis", email: "carol@example.com", role: "Viewer" },
  { id: 4, name: "David Wilson", email: "david@example.com", role: "Editor" },
  { id: 5, name: "Eve Martinez", email: "eve@example.com", role: "Admin" },
]

Alpine.magic("users", () => users)

Alpine.plugin(usePlugin("presence", presence))
Alpine.plugin(usePlugin("dialog", dialog))
Alpine.start()
