import * as scrollArea from "@zag-js/scroll-area"
import type { PropTypes } from "@zag-js/types"
import { Component } from "./component"
import { normalizeProps, spreadProps, VanillaMachine } from "@zag-js/vanilla"

export class ScrollArea extends Component<scrollArea.Props, scrollArea.Api<PropTypes>> {
  initMachine(props: scrollArea.Props) {
    return new VanillaMachine(scrollArea.machine, {
      ...props,
    })
  }

  initApi() {
    return scrollArea.connect(this.machine.service, normalizeProps)
  }

  render() {
    spreadProps(this.rootEl, this.api.getRootProps())

    const viewport = this.rootEl.querySelector<HTMLElement>(".scroll-area-viewport")
    if (viewport) spreadProps(viewport, this.api.getViewportProps())

    const content = this.rootEl.querySelector<HTMLElement>(".scroll-area-content")
    if (content) spreadProps(content, this.api.getContentProps())

    const scrollbarY = this.rootEl.querySelector<HTMLElement>(".scroll-area-scrollbar-y")
    const thumbY = this.rootEl.querySelector<HTMLElement>(".scroll-area-thumb-y")

    if (scrollbarY && thumbY) {
      if (this.api.hasOverflowY) {
        scrollbarY.hidden = false
        spreadProps(scrollbarY, this.api.getScrollbarProps({ orientation: "vertical" }))
        spreadProps(thumbY, this.api.getThumbProps({ orientation: "vertical" }))
      } else {
        scrollbarY.hidden = true
      }
    }

    const scrollbarX = this.rootEl.querySelector<HTMLElement>(".scroll-area-scrollbar-x")
    const thumbX = this.rootEl.querySelector<HTMLElement>(".scroll-area-thumb-x")

    if (scrollbarX && thumbX) {
      if (this.api.hasOverflowX) {
        scrollbarX.hidden = false
        spreadProps(scrollbarX, this.api.getScrollbarProps({ orientation: "horizontal" }))
        spreadProps(thumbX, this.api.getThumbProps({ orientation: "horizontal" }))
      } else {
        scrollbarX.hidden = true
      }
    }
  }
}
