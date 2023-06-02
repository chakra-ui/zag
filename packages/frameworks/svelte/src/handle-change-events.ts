import { onDestroy } from "svelte/internal"
import { get, writable } from "svelte/store"

export function handleChangeEvents(node: HTMLInputElement) {
  const prevChangedProp = writable(node.checked)
  const clicked = writable(false)
  const changed = writable(false)

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes" && mutation.target.nodeName === "INPUT") {
        const target = mutation.target as HTMLInputElement
        changed.set(get(prevChangedProp) !== target.checked)

        prevChangedProp.set(target.checked)
      }
    })
  })

  observer.observe(node, {
    attributes: true,
  })

  const handleInputClick = (e: Event) => {
    if (e.isTrusted) clicked.set(true)
    else clicked.set(false)
  }

  if (node.tagName === "INPUT") {
    node.addEventListener("click", handleInputClick)
  }

  changed.subscribe((changeVal) => {
    const isClicked = get(clicked)
    if (changeVal && !isClicked) {
      node.dispatchEvent(new Event("change"))
      clicked.set(false)
    }
  })

  onDestroy(() => {
    node.removeEventListener("click", handleInputClick)
  })
}
