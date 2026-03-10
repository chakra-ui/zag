import * as menu from "@zag-js/menu"
import { menuControls, menuData, menuOptionData } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useControls, usePlugin } from "../lib"

const [level1, level2, level3] = menuData
Alpine.magic("level1", () => level1)
Alpine.magic("level2", () => level2)
Alpine.magic("level3", () => level3)

Alpine.data("radios", () => ({
  order: "",
  get radios() {
    return menuOptionData.order.map((item) => ({
      type: "radio" as const,
      name: "order",
      value: item.value,
      label: item.label,
      checked: this.order === item.value,
      onCheckedChange: (checked: boolean) => {
        this.order = checked ? item.value : ""
      },
    }))
  },
}))
Alpine.data("checkboxes", () => ({
  type: [] as string[],
  get checkboxes() {
    return menuOptionData.type.map((item) => ({
      type: "checkbox" as const,
      name: "type",
      value: item.value,
      label: item.label,
      checked: this.type.includes(item.value),
      onCheckedChange: (checked: boolean) => {
        this.type = checked ? [...this.type, item.value] : this.type.filter((x) => x !== item.value)
      },
    }))
  },
}))

Alpine.data("menu", useControls(menuControls))
Alpine.plugin(usePlugin("menu", menu))
Alpine.start()
