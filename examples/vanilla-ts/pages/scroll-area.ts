import "@zag-js/shared/src/style.css"

import { nanoid } from "nanoid"
import { ScrollArea } from "../src/scroll-area"

document.querySelectorAll<HTMLElement>(".scroll-area-root").forEach((rootEl) => {
  // Populate content with items
  const content = rootEl.querySelector<HTMLElement>(".scroll-area-content")
  if (content) {
    for (let i = 0; i < 100; i++) {
      const div = document.createElement("div")
      div.textContent = `Item ${i}`
      div.style.padding = "8px"
      content.appendChild(div)
    }
  }

  const scrollArea = new ScrollArea(rootEl, {
    id: nanoid(),
  })

  scrollArea.init()

  // Add scroll to bottom functionality
  const scrollBtn = document.querySelector<HTMLElement>(".scroll-to-bottom-btn")
  if (scrollBtn) {
    scrollBtn.addEventListener("click", () => {
      scrollArea.api.scrollToEdge({ edge: "bottom" })
    })
  }
})
