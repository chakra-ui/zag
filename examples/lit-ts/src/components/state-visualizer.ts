import { LitElement, html } from "lit"
import { customElement, property } from "lit/decorators.js"
import { unsafeHTML } from "lit/directives/unsafe-html.js"
import type { MachineSchema, Service } from "@zag-js/core"
import { highlightState } from "@zag-js/stringify-state"

@customElement("state-visualizer")
export class StateVisualizer<T extends MachineSchema = any> extends LitElement {
  protected createRenderRoot() {
    return this
  }

  @property({ attribute: false })
  state!: Service<T>

  @property({ type: String })
  label?: string

  @property({ attribute: false })
  omit?: string[]

  @property({ attribute: false })
  context?: Array<keyof T["context"]>

  render() {
    if (!this.state) {
      return html`<div class="viz"><pre>No state available</pre></div>`
    }

    const obj = {
      state: this.state.state.get(),
      event: this.state.event.current(),
      previousEvent: this.state.event.previous(),
      context: this.context
        ? Object.fromEntries(this.context.map((key) => [key, this.state.context.get(key)]))
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
