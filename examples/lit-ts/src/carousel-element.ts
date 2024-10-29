import { spread } from "@open-wc/lit-helpers"
import * as carousel from "@zag-js/carousel"
import { carouselData } from "@zag-js/shared"
import { PropTypes } from "@zag-js/types"
import { html, unsafeCSS } from "lit"
import { customElement } from "lit/decorators.js"
import styles from "../../../shared/src/css/carousel.css?inline"
import { Component } from "./component"
import { normalizeProps } from "./normalize-props"

@customElement("carousel-element")
export class CarouselElement extends Component<
  carousel.Context,
  carousel.MachineContext,
  carousel.Api,
  carousel.Service
> {
  initService(context: carousel.Context): carousel.Service {
    return carousel.machine({ ...context, id: "1", index: 0, spacing: "20px", slidesPerView: 2 })
  }

  initApi(): carousel.Api<PropTypes> {
    return carousel.connect(this.state, this.service.send, normalizeProps)
  }

  render() {
    return html`
      <div ${spread(this.api.getRootProps())}>
        <button ${spread(this.api.getPrevTriggerProps())}>Prev</button>
        <button ${spread(this.api.getNextTriggerProps())}>Next</button>
        <div ${spread(this.api.getViewportProps())}>
          <div ${spread(this.api.getItemGroupProps())}>
            ${carouselData.map(
              (image, index) =>
                html`<div ${spread(this.api.getItemProps({ index }))}>
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
