import "@zag-js/shared/src/style.css"
import * as wheelPicker from "@zag-js/wheel-picker"
import { normalizeProps, VanillaMachine, spreadProps } from "@zag-js/vanilla"
import { nanoid } from "nanoid"
const collection = wheelPicker.collection({
  items: ["React", "Vue", "Angular", "Svelte", "Solid", "Preact"].map((label) => ({
    label,
    value: label.toLowerCase(),
  })),
})
const root = document.querySelector<HTMLElement>(".wheel-picker-root")!
const machine = new VanillaMachine(wheelPicker.machine, {
  id: nanoid(),
  collection,
  defaultValue: "react",
  name: "framework",
})
function render() {
  const api = wheelPicker.connect(machine.service, normalizeProps)
  const set = (selector: string, props: any) => {
    const element = root.querySelector(selector)
    if (element) spreadProps(element, props, machine.scope.id)
  }
  spreadProps(root, api.getRootProps(), machine.scope.id)
  set(".wheel-picker-label", api.getLabelProps())
  set(".wheel-picker-control", api.getControlProps())
  set(".wheel-picker-viewport", api.getViewportProps())
  set(".wheel-picker-items", api.getItemGroupProps())
  set(".wheel-picker-highlight", api.getHighlightProps())
  set(".wheel-picker-highlight-items", api.getHighlightItemGroupProps())
  set(".wheel-picker-hidden-select", api.getHiddenSelectProps())
  root.querySelector(".wheel-picker-items")!.replaceChildren(
    ...api.items.map(({ item, index }) => {
      const el = document.createElement("li")
      el.textContent = item.label
      spreadProps(el, api.getItemProps({ item, index }), machine.scope.id)
      return el
    }),
  )
  root.querySelector(".wheel-picker-highlight-items")!.replaceChildren(
    ...api.highlightItems.map(({ item, index }) => {
      const el = document.createElement("li")
      el.textContent = item.label
      spreadProps(el, api.getHighlightItemProps({ item, index }), machine.scope.id)
      return el
    }),
  )
  root
    .querySelector(".wheel-picker-hidden-select")!
    .replaceChildren(...collection.items.map((item) => new Option(item.label, item.value)))
  root.parentElement!.querySelector(".wheel-picker-output")!.textContent = `Selected: ${api.valueAsString}`
}
render()
machine.subscribe(render)
machine.start()
