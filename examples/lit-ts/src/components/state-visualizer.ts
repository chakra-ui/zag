import { LitElement, html, unsafeCSS } from "lit"
import { customElement, property } from "lit/decorators.js"
import { unsafeHTML } from "lit/directives/unsafe-html.js"
import type { MachineSchema, Service } from "@zag-js/core"
import { highlightState } from "@zag-js/stringify-state"
import styleLayout from "@zag-js/shared/src/css/layout.css?inline"

@customElement("state-visualizer")
export class StateVisualizer<T extends MachineSchema = any> extends LitElement {
  static styles = unsafeCSS(styleLayout)

  @property({ attribute: false })
  state?: Service<T>

  @property({ type: String })
  label?: string

  @property({ attribute: false })
  omit?: string[]

  @property({ attribute: false })
  context?: Array<keyof T["context"]>

  render() {
    const service = this.state

    if (!service) {
      return html`<div class="viz"><pre>No state available</pre></div>`
    }

    const obj = {
      state: service.state.get(),
      event: service.event.current(),
      previousEvent: service.event.previous(),
      context: this.context
        ? Object.fromEntries(this.context.map((key) => [key, service.context.get(key)]))
        : undefined,
    }

    const highlighted = highlightState(obj, this.omit)

    return html`
      <div class="viz">
        <pre dir="ltr" style="white-space: normal;">
          <details open>
            <summary style="white-space: pre;"> ${this.label || "Visualizer"} </summary>
            <div style="white-space: pre;">${unsafeHTML(highlighted)}</div>
          </details>
        </pre>
      </div>
    `
  }
}
