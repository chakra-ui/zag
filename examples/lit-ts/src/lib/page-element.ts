import { LitElement } from "lit"

// Detect DOM mode - use Vite's import.meta.env for client-side access
// These are injected at build time by Vite
const DOM_MODE = import.meta.env?.VITE_DOM_MODE === "light-dom" ? "light-dom" : "shadow-dom"

/**
 * Base class for page components that automatically switches between Shadow DOM and Light DOM
 * based on the testing context.
 *
 * Environment Variables:
 * - DOM_MODE=shadow-dom: Force Shadow DOM regardless of framework
 * - DOM_MODE=light-dom: Force Light DOM regardless of framework
 * - FRAMEWORK=lit: Default to Shadow DOM (can be overridden by DOM_MODE)
 * - Default: Light DOM for CSS compatibility
 */
export class PageElement extends LitElement {
  constructor() {
    super()

    // Use Light DOM by default for CSS compatibility, unless explicitly testing Shadow DOM
    if (DOM_MODE === "light-dom") {
      this.createRenderRoot = () => this
    }
    // When DOM_MODE === 'shadow-dom', use default Lit behavior (Shadow DOM)
  }
}
