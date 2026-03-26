import "@zag-js/shared/src/style.css"

import { nanoid } from "nanoid"
import { TagsInput } from "../src/tags-input"

document.querySelectorAll<HTMLElement>(".tags-input").forEach((rootEl) => {
  const tagsInput = new TagsInput(rootEl, {
    id: nanoid(),
    defaultValue: ["React", "Vue", "Svelte"],
  })

  tagsInput.init()
})
