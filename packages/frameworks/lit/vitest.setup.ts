import "@testing-library/jest-dom/vitest"
import { JSDOM } from "jsdom"

const { window } = new JSDOM()

// @ts-ignore
window.requestAnimationFrame = (cb: VoidFunction) => setTimeout(cb, 1000 / 60)

Object.assign(global, { window, document: window.document })
