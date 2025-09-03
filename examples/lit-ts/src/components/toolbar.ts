import { LitElement, html, unsafeCSS } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import type { Service } from "@zag-js/core"
import styleLayout from "@zag-js/shared/src/css/layout.css?inline"
import type { ControlsController } from "../lib/controls-controller"

@customElement("zag-toolbar")
export class Toolbar extends LitElement {
  static styles = unsafeCSS(styleLayout)

  @property({ attribute: false })
  controls?: ControlsController<any>

  @property({ attribute: false })
  service?: Service<any>

  @state()
  private activeTab = 0

  render() {
    const hasControls = !!this.controls

    return html`
      <div class="toolbar" style="height: 100%;">
        <nav>
          ${hasControls
            ? html`
                <button ?data-active=${this.activeTab === 0} @click=${() => (this.activeTab = 0)}>Controls</button>
              `
            : ""}
          <button
            ?data-active=${this.activeTab === (hasControls ? 1 : 0)}
            @click=${() => (this.activeTab = hasControls ? 1 : 0)}
          >
            Visualizer
          </button>
        </nav>

        <div>
          ${hasControls
            ? html` <div ?data-active=${this.activeTab === 0} data-content>${this.renderControls()}</div> `
            : ""}
          <div ?data-active=${this.activeTab === (hasControls ? 1 : 0)} data-content>
            ${this.renderStateVisualizer()}
          </div>
        </div>
      </div>
    `
  }

  private renderControls() {
    if (!this.controls) return ""

    return html`
      <div class="controls-container">
        ${this.controls.getControlKeys().map((key) => {
          const config = this.controls!.getControlConfig(key)
          const value = this.controls!.getValue(key)
          const { type, label = key, options, placeholder, min, max } = config

          switch (type) {
            case "boolean":
              return html`
                <div class="checkbox">
                  <input
                    type="checkbox"
                    id=${label}
                    data-testid=${key}
                    .checked=${value}
                    @change=${(e: Event) => {
                      const target = e.target as HTMLInputElement
                      this.controls!.setState(key, target.checked)
                    }}
                  />
                  <label for=${label}>${label}</label>
                </div>
              `
            case "string":
              return html`
                <div class="text">
                  <label for=${label}>${label}</label>
                  <input
                    type="text"
                    id=${label}
                    data-testid=${key}
                    .value=${value}
                    placeholder=${placeholder || ""}
                    @keydown=${(e: KeyboardEvent) => {
                      if (e.key === "Enter") {
                        const target = e.target as HTMLInputElement
                        this.controls!.setState(key, target.value)
                      }
                    }}
                  />
                </div>
              `
            case "select":
              return html`
                <div class="text">
                  <label for=${label}>${label}</label>
                  <select
                    id=${label}
                    data-testid=${key}
                    .value=${value}
                    @change=${(e: Event) => {
                      const target = e.target as HTMLSelectElement
                      this.controls!.setState(key, target.value)
                    }}
                  >
                    <option value="">-----</option>
                    ${options?.map((option: string) => html` <option value=${option}>${option}</option> `)}
                  </select>
                </div>
              `
            case "number":
              return html`
                <div class="text">
                  <label for=${label}>${label}</label>
                  <input
                    type="number"
                    id=${label}
                    data-testid=${key}
                    .value=${value}
                    min=${min || ""}
                    max=${max || ""}
                    @keydown=${(e: KeyboardEvent) => {
                      if (e.key === "Enter") {
                        const target = e.target as HTMLInputElement
                        const val = parseFloat(target.value)
                        this.controls!.setState(key, isNaN(val) ? 0 : val)
                      }
                    }}
                  />
                </div>
              `
            default:
              return ""
          }
        })}
      </div>
    `
  }

  private renderStateVisualizer() {
    if (!this.service) {
      return html`<div class="state-visualizer"><pre>No service available</pre></div>`
    }

    return html`
      <div class="state-visualizer">
        <h4>State</h4>
        <pre>${JSON.stringify(this.service.state.get(), null, 2)}</pre>
      </div>
    `
  }
}
