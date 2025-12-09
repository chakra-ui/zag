import * as menu from "@zag-js/menu"
import { menuData, menuOptionData } from "@zag-js/shared"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

const [level1, level2, level3] = menuData
Alpine.magic("level1", () => level1)
Alpine.magic("level2", () => level2)
Alpine.magic("level3", () => level3)

Alpine.data("radios", () => ({
  get radios() {
    return menuOptionData.order.map((item) => ({
      type: "radio" as const,
      name: "order",
      value: item.value,
      label: item.label,
      // @ts-ignore
      checked: this.$data.order === item.value,
      onCheckedChange: (checked: boolean) => {
        // @ts-ignore
        this.$data.order = checked ? item.value : ""
      },
    }))
  },
}))
Alpine.data("checkboxes", () => ({
  get checkboxes() {
    return menuOptionData.type.map((item) => ({
      type: "checkbox" as const,
      name: "type",
      value: item.value,
      label: item.label,
      // @ts-ignore
      checked: this.$data.type.includes(item.value),
      onCheckedChange: (checked: boolean) => {
        // @ts-ignore
        this.$data.type = checked ? [...this.$data.type, item.value] : this.$data.type.filter((x) => x !== item.value)
      },
    }))
  },
}))

Alpine.plugin(usePlugin("menu", menu))
Alpine.start()
