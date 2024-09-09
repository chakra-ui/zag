import { spread } from "@open-wc/lit-helpers"
import * as carousel from "@zag-js/carousel"
import { StateFrom } from "@zag-js/core"
import { carouselData } from "@zag-js/shared"
import { LitElement, html, unsafeCSS } from "lit"
import { customElement, state } from "lit/decorators.js"
import { normalizeProps } from "./normalize-props"
import styles from "../../../shared/src/css/carousel.css?inline"

@customElement("carousel-element")
export class CarouselElement extends LitElement {
  private service: carousel.Service

  @state()
  private state: StateFrom<carousel.Service>

  constructor() {
    super()
    this.service = carousel.machine({ id: "1", index: 0, spacing: "20px", slidesPerView: 2 })
    this.service._created()

    this.state = this.service.getState()
    this.service.subscribe((state) => {
      this.state = state
    })
  }

  connectedCallback(): void {
    super.connectedCallback()
    this.service.start()
  }

  disconnectedCallback(): void {
    super.disconnectedCallback()
    this.service.stop()
  }

  render() {
    const api = carousel.connect(this.state, this.service.send, normalizeProps)

    return html`
      <div ${spread(api.getRootProps())}>
        <button ${spread(api.getPrevTriggerProps())}>Prev</button>
        <button ${spread(api.getNextTriggerProps())}>Next</button>
        <div ${spread(api.getViewportProps())}>
          <div ${spread(api.getItemGroupProps())}>
            ${carouselData.map(
              (image, index) =>
                html`<div ${spread(api.getItemProps({ index }))}>
                  <img src="${image}" alt="" style="height: 300px; width: 100%; object-fit: cover;" />
                </div>`,
            )}
          </div>
        </div>
      </div>
    `
  }

  static styles = unsafeCSS(styles)
}

declare global {
  interface HTMLElementTagNameMap {
    "carousel-element": CarouselElement
  }
}
