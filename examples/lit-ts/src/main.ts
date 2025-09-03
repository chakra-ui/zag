import { LitElement, html } from "lit"
import { customElement, property } from "lit/decorators.js"
import { routesData } from "@zag-js/shared"

import "@zag-js/shared/src/style.css"
import "./main.css"

// Import toolbar components
import "./components/toolbar"
import "./components/state-visualizer"

// Import all page components
import "./pages/accordion"

@customElement("zag-app")
export class ZagApp extends LitElement {
  // Light dom (no shadow root) due to css
  protected createRenderRoot() {
    return this
  }

  @property({ type: String })
  currentPath = window.location.pathname

  connectedCallback() {
    super.connectedCallback()
    this.updatePath()
    window.addEventListener("popstate", this.updatePath)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener("popstate", this.updatePath)
  }

  private updatePath = () => {
    this.currentPath = window.location.pathname
  }

  private navigate(path: string) {
    window.history.pushState({}, "", path)
    this.currentPath = path
  }

  private renderContent() {
    switch (this.currentPath) {
      case "/accordion":
        return html`<accordion-page class="component-page"></accordion-page>`
      default:
        return this.renderHome()
    }
  }

  private renderHome() {
    return html`
      <div class="index-nav">
        <h2>Zag.js + Lit</h2>
        <p>Select a component from the sidebar to see it in action.</p>
      </div>
    `
  }

  render() {
    const routes = routesData.filter((route) =>
      // Only show routes we have implemented
      ["/accordion"].includes(route.path),
    )

    return html`
      <div class="page">
        <aside class="nav">
          <header>Zagjs</header>
          <a
            href="/"
            ?data-active=${this.currentPath === "/"}
            @click=${(e: Event) => {
              e.preventDefault()
              this.navigate("/")
            }}
          >
            Home
          </a>
          ${routes.map(
            (route) => html`
              <a
                href=${route.path}
                ?data-active=${this.currentPath === route.path}
                @click=${(e: Event) => {
                  e.preventDefault()
                  this.navigate(route.path)
                }}
              >
                ${route.label}
              </a>
            `,
          )}
        </aside>
        ${this.renderContent()}
      </div>
    `
  }
}
