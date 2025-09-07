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
import "./pages/checkbox"
import "./pages/dialog"
import "./pages/dialog-nested"
import "./pages/menu"
import "./pages/popover"
import "./pages/radio-group"
import "./pages/switch"
import "./pages/tabs"
import "./pages/toggle"
import "./pages/toggle-group"

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
      case "/checkbox":
        return html`<checkbox-page class="component-page"></checkbox-page>`
      case "/dialog":
        return html`<dialog-page class="component-page"></dialog-page>`
      case "/dialog-nested":
        return html`<dialog-nested-page class="component-page"></dialog-nested-page>`
      case "/menu":
        return html`<menu-page class="component-page"></menu-page>`
      case "/popover":
        return html`<popover-page class="component-page"></popover-page>`
      case "/radio-group":
        return html`<radio-group-page class="component-page"></radio-group-page>`
      case "/switch":
        return html`<switch-page class="component-page"></switch-page>`
      case "/tabs":
        return html`<tabs-page class="component-page"></tabs-page>`
      case "/toggle":
        return html`<toggle-page class="component-page"></toggle-page>`
      case "/toggle-group":
        return html`<toggle-group-page class="component-page"></toggle-group-page>`
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
      [
        "/accordion",
        "/checkbox",
        "/dialog",
        "/dialog-nested",
        "/menu",
        "/popover",
        "/radio-group",
        "/switch",
        "/tabs",
        "/toggle",
        "/toggle-group",
      ].includes(route.path),
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
