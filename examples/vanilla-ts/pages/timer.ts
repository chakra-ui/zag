import "../../shared/styles/style.module.css"

import { nanoid } from "nanoid"
import { Timer } from "../src/timer"

document.querySelectorAll<HTMLElement>(".timer").forEach((rootEl) => {
  const timer = new Timer(rootEl, {
    id: nanoid(),
    countdown: true,
    startMs: 60 * 1000, // 1 minute countdown
  })

  timer.init()
})
