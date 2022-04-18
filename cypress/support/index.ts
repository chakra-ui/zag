/* eslint-disable @typescript-eslint/no-unused-vars */
/// <reference types="cypress" />

// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "@testing-library/cypress/add-commands"
import "cypress-real-events/support"
import "cypress-plugin-tab"
import "./commands"

type Point = { x: number; y: number }

declare global {
  namespace Cypress {
    interface Chainable {
      pan(from: Point, to: Point, range?: [number, number]): Chainable<Element>
      paste(text: string): Chainable<Element>
      clickOutside(): Chainable<Element>
      findByPart(label: string): Chainable<Element>
      realInput(
        value: string,
        options?: {
          overwrite?: boolean
          prepend?: boolean
          inputType?: "insertText" | "insertFromPaste"
        },
      ): Chainable<void>
    }
  }
}
