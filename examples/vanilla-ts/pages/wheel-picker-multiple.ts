import "@zag-js/shared/src/style.css"
import * as wheelPicker from "@zag-js/wheel-picker"
import { normalizeProps, VanillaMachine, spreadProps } from "@zag-js/vanilla"
import { nanoid } from "nanoid"
const numbers = (length: number, add = 0) =>
  wheelPicker.collection({
    items: Array.from({ length }, (_, i) => ({ label: String(i + add).padStart(2, "0"), value: String(i + add) })),
  })
const group = document.querySelector<HTMLElement>(".wheel-picker-group")!,
  output = document.querySelector<HTMLOutputElement>(".wheel-picker-output")!,
  configs = [
    [numbers(12, 1), "9", true],
    [numbers(60), "41", true],
    [wheelPicker.collection({ items: ["AM", "PM"].map((value) => ({ label: value, value })) }), "AM", false],
  ] as const
const machines = configs.map(
  ([collection, defaultValue, infinite]) =>
    new VanillaMachine(wheelPicker.machine, { id: nanoid(), collection, defaultValue, infinite }),
)
function render() {
  group.replaceChildren(
    ...machines.map((machine) => {
      const api = wheelPicker.connect(machine.service, normalizeProps),
        root = document.createElement("div"),
        control = document.createElement("div"),
        viewport = document.createElement("div"),
        items = document.createElement("ul"),
        highlight = document.createElement("div"),
        highlights = document.createElement("ul")
      spreadProps(root, api.getRootProps(), machine.scope.id)
      spreadProps(control, api.getControlProps(), machine.scope.id)
      spreadProps(viewport, api.getViewportProps(), machine.scope.id)
      spreadProps(items, api.getItemGroupProps(), machine.scope.id)
      spreadProps(highlight, api.getHighlightProps(), machine.scope.id)
      spreadProps(highlights, api.getHighlightItemGroupProps(), machine.scope.id)
      for (const { item, index } of api.items) {
        const el = document.createElement("li")
        el.textContent = item.label
        spreadProps(el, api.getItemProps({ item, index }), machine.scope.id)
        items.append(el)
      }
      for (const { item, index } of api.highlightItems) {
        const el = document.createElement("li")
        el.textContent = item.label
        spreadProps(el, api.getHighlightItemProps({ item, index }), machine.scope.id)
        highlights.append(el)
      }
      highlight.append(highlights)
      viewport.append(items, highlight)
      control.append(viewport)
      root.append(control)
      return root
    }),
  )
  output.textContent = `Selected time: ${machines.map((machine) => wheelPicker.connect(machine.service, normalizeProps).valueAsString).join(":")}`
}
render()
machines.forEach((machine) => {
  machine.subscribe(render)
  machine.start()
})
