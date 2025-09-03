import { LitElement, html, css } from "lit"
import { customElement, state } from "lit/decorators.js"
import "./components/accordion-demo.js"
import "./components/toggle-demo.js"

interface RouteData {
  path: string
  label: string
  component: string
}

const routes: RouteData[] = [
  { path: "/accordion", label: "Accordion", component: "accordion-demo" },
  { path: "/toggle", label: "Toggle", component: "toggle-demo" },
]

@customElement("zag-app")
export class ZagApp extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
  `

  static properties = {
    currentPath: { state: true },
  }

  declare currentPath: string

  connectedCallback() {
    super.connectedCallback()
    this.currentPath = window.location.pathname
    window.addEventListener("popstate", this._handlePopState)
    this._handleNavigation()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener("popstate", this._handlePopState)
  }

  private _handlePopState = () => {
    this.currentPath = window.location.pathname
  }

  private _handleNavigation() {
    // Simple client-side routing
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement
      if (target.tagName === "A" && target.getAttribute("href")?.startsWith("/")) {
        e.preventDefault()
        const path = target.getAttribute("href")!
        history.pushState(null, "", path)
        this.currentPath = path
      }
    })
  }

  render() {
    if (this.currentPath === "/" || this.currentPath === "") {
      return this._renderIndex()
    }

    const route = routes.find((r) => r.path === this.currentPath)
    if (route) {
      return html`
        <div class="page">
          <h1>${route.label}</h1>
          <div class="demo">${this._renderComponent(route.component)}</div>
          <a href="/">← Back to home</a>
        </div>
      `
    }

    return html`<div class="page">
      <h1>404 - Not Found</h1>
      <a href="/">← Back to home</a>
    </div>`
  }

  private _renderIndex() {
    return html`
      <div class="index-nav">
        <h2>Zag.js + Lit</h2>
        <ul>
          ${routes.map(
            (route) => html`
              <li>
                <a href="${route.path}">${route.label}</a>
              </li>
            `,
          )}
        </ul>
      </div>
    `
  }

  private _renderComponent(componentName: string) {
    switch (componentName) {
      case "accordion-demo":
        return html`<accordion-demo></accordion-demo>`
      case "toggle-demo":
        return html`<toggle-demo></toggle-demo>`
      default:
        return html`<div>Component not found</div>`
    }
  }
}
