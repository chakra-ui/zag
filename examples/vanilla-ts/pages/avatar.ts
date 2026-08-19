import "@styles/global.css"
import "@styles/avatar.css"

import { Avatar } from "../src/avatar"
import { nanoid } from "nanoid"

document.querySelectorAll<HTMLElement>(".avatar").forEach((rootEl) => {
  const avatar = new Avatar(rootEl, { id: nanoid() })
  avatar.init()
})
