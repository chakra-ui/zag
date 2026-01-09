import * as carousel from "@zag-js/carousel"
import { Component } from "./component"
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla"

export class Carousel extends Component<carousel.Props, carousel.Api> {
  images: string[] = []

  constructor(rootEl: HTMLElement | null, props: carousel.Props & { images: string[] }) {
    const { images, ...machineProps } = props
    super(rootEl, machineProps)
    this.images = images
  }

  initMachine(props: carousel.Props) {
    return new VanillaMachine(carousel.machine, {
      ...props,
    })
  }

  initApi() {
    return carousel.connect(this.machine.service, normalizeProps)
  }

  syncItems = () => {
    const itemGroup = this.rootEl.querySelector<HTMLElement>(".carousel-item-group")
    if (!itemGroup) return

    const existingItems = Array.from(itemGroup.querySelectorAll<HTMLElement>(".carousel-item"))

    // Remove excess items
    while (existingItems.length > this.images.length) {
      const item = existingItems.pop()
      if (item) itemGroup.removeChild(item)
    }

    // Update or create items
    this.images.forEach((image, index) => {
      let itemEl = existingItems[index]

      if (!itemEl) {
        // Create new item
        itemEl = this.doc.createElement("div")
        itemEl.className = "carousel-item"

        const img = this.doc.createElement("img")
        img.src = image
        img.alt = `Slide ${index + 1}`
        img.width = 188
        itemEl.appendChild(img)

        itemGroup.appendChild(itemEl)
      }

      // Update props
      this.spreadProps(itemEl, this.api.getItemProps({ index }))

      const img = itemEl.querySelector("img")
      if (img) img.src = image
    })
  }

  syncIndicators = () => {
    const indicatorGroup = this.rootEl.querySelector<HTMLElement>(".carousel-indicator-group")
    if (!indicatorGroup) return

    const existingIndicators = Array.from(indicatorGroup.querySelectorAll<HTMLElement>(".carousel-indicator"))

    // Remove excess indicators
    while (existingIndicators.length > this.api.pageSnapPoints.length) {
      const indicator = existingIndicators.pop()
      if (indicator) indicatorGroup.removeChild(indicator)
    }

    // Update or create indicators
    this.api.pageSnapPoints.forEach((_, index) => {
      let indicatorEl = existingIndicators[index]

      if (!indicatorEl) {
        // Create new indicator
        indicatorEl = this.doc.createElement("button")
        indicatorEl.className = "carousel-indicator"
        indicatorGroup.appendChild(indicatorEl)
      }

      // Update props
      this.spreadProps(indicatorEl, this.api.getIndicatorProps({ index }))
    })
  }

  render() {
    this.spreadProps(this.rootEl, this.api.getRootProps())

    const control = this.rootEl.querySelector<HTMLElement>(".carousel-control")
    if (control) this.spreadProps(control, this.api.getControlProps())

    const autoplayBtn = this.rootEl.querySelector<HTMLElement>(".carousel-autoplay")
    if (autoplayBtn) {
      this.spreadProps(autoplayBtn, this.api.getAutoplayTriggerProps())
      autoplayBtn.textContent = this.api.isPlaying ? "Stop" : "Play"
    }

    const prevBtn = this.rootEl.querySelector<HTMLElement>(".carousel-prev")
    if (prevBtn) this.spreadProps(prevBtn, this.api.getPrevTriggerProps())

    const nextBtn = this.rootEl.querySelector<HTMLElement>(".carousel-next")
    if (nextBtn) this.spreadProps(nextBtn, this.api.getNextTriggerProps())

    const itemGroup = this.rootEl.querySelector<HTMLElement>(".carousel-item-group")
    if (itemGroup) this.spreadProps(itemGroup, this.api.getItemGroupProps())

    const indicatorGroup = this.rootEl.querySelector<HTMLElement>(".carousel-indicator-group")
    if (indicatorGroup) this.spreadProps(indicatorGroup, this.api.getIndicatorGroupProps())

    // Sync items and indicators
    this.syncItems()
    this.syncIndicators()
  }
}
