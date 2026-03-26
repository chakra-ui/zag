import "../../shared/styles/style.module.css"

import { nanoid } from "nanoid"
import { PasswordInput } from "../src/password-input"

document.querySelectorAll<HTMLElement>(".password-input").forEach((rootEl) => {
  const passwordInput = new PasswordInput(rootEl, {
    id: nanoid(),
  })

  passwordInput.init()
})
