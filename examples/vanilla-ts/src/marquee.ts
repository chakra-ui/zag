import * as marquee from "@zag-js/marquee"
import { Component } from "./component"
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla"

const marqueeData = [
  { name: "Apple", logo: "🍎" },
  { name: "Banana", logo: "🍌" },
  { name: "Cherry", logo: "🍒" },
  { name: "Grape", logo: "🍇" },
]

export class Marquee extends Component<marquee.Props, marquee.Api> {
  initMachine(props: marquee.Props) {
    return new VanillaMachine(marquee.machine, {
      spacing: "2rem",
      ...props,
    })
  }

  initApi() {
    return marquee.connect(this.machine.service, normalizeProps)
  }

  syncContent = () => {
    const viewport = this.rootEl.querySelector<HTMLElement>(".marquee-viewport")
    if (!viewport) return

    const existingContents = Array.from(viewport.querySelectorAll<HTMLElement>(".marquee-content"))

    // Remove excess content
    while (existingContents.length > this.api.contentCount) {
      const content = existingContents.pop()
      if (content) viewport.removeChild(content)
    }

    // Update or create content
    Array.from({ length: this.api.contentCount }).forEach((_, index) => {
      let contentEl = existingContents[index]

      if (!contentEl) {
        // Create new content
        contentEl = this.doc.createElement("div")
        contentEl.className = "marquee-content"
        viewport.appendChild(contentEl)

        // Add items to content
        marqueeData.forEach(() => {
          const itemEl = this.doc.createElement("div")
          itemEl.className = "marquee-item"

          const logoEl = this.doc.createElement("span")
          logoEl.className = "marquee-logo"
          itemEl.appendChild(logoEl)

          const nameEl = this.doc.createElement("span")
          nameEl.className = "marquee-name"
          itemEl.appendChild(nameEl)

          contentEl.appendChild(itemEl)
        })
      }

      // Always spread props
      this.spreadProps(contentEl, this.api.getContentProps({ index }))

      // Update items
      const items = Array.from(contentEl.querySelectorAll<HTMLElement>(".marquee-item"))
      items.forEach((itemEl, i) => {
        const item = marqueeData[i]
        if (!item) return

        this.spreadProps(itemEl, this.api.getItemProps())

        const logoEl = itemEl.querySelector<HTMLElement>(".marquee-logo")
        if (logoEl) logoEl.textContent = item.logo

        const nameEl = itemEl.querySelector<HTMLElement>(".marquee-name")
        if (nameEl) nameEl.textContent = item.name
      })
    })
  }

  render() {
    this.spreadProps(this.rootEl, this.api.getRootProps())

    const edgeStart = this.rootEl.querySelector<HTMLElement>(".marquee-edge-start")
    if (edgeStart) this.spreadProps(edgeStart, this.api.getEdgeProps({ side: "start" }))

    const viewport = this.rootEl.querySelector<HTMLElement>(".marquee-viewport")
    if (viewport) this.spreadProps(viewport, this.api.getViewportProps())

    const edgeEnd = this.rootEl.querySelector<HTMLElement>(".marquee-edge-end")
    if (edgeEnd) this.spreadProps(edgeEnd, this.api.getEdgeProps({ side: "end" }))

    // Control buttons (query from document since they're outside root)
    const pauseBtn = this.doc.querySelector<HTMLElement>(".marquee-pause")
    if (pauseBtn) {
      pauseBtn.onclick = () => this.api.pause()
    }

    const resumeBtn = this.doc.querySelector<HTMLElement>(".marquee-resume")
    if (resumeBtn) {
      resumeBtn.onclick = () => this.api.resume()
    }

    const toggleBtn = this.doc.querySelector<HTMLElement>(".marquee-toggle")
    if (toggleBtn) {
      toggleBtn.onclick = () => this.api.togglePause()
    }

    const status = this.doc.querySelector<HTMLElement>(".marquee-status")
    if (status) {
      status.textContent = `Status: ${this.api.paused ? "Paused" : "Playing"}`
    }

    // Sync content after all other props are set
    this.syncContent()
  }
}
