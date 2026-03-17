import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { comboboxControls, comboboxData } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useControls, usePlugin } from "../lib"
import { useAsyncList } from "./use-async-list"

const items = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "Solid", value: "solid" },
]

const frameworks = [
  { label: "React", value: "react" },
  { label: "Solid", value: "solid" },
  { label: "Vue", value: "vue" },
  { label: "Angular", value: "angular" },
  { label: "Svelte", value: "svelte" },
  { label: "Preact", value: "preact" },
  { label: "Qwik", value: "qwik" },
  { label: "Lit", value: "lit" },
  { label: "Alpine.js", value: "alpinejs" },
  { label: "Ember", value: "ember" },
  { label: "Next.js", value: "nextjs" },
]

const { contains } = createFilter({ sensitivity: "base" })

interface Item {
  name: string
  url: string
}

Alpine.magic("items", () => items)
Alpine.magic("frameworks", () => frameworks)
Alpine.magic("contains", () => contains)
Alpine.data("asyncList", () => ({
  asyncList: useAsyncList<Item>({
    autoReload: true,
    async load({ signal, filterText }) {
      const response = await fetch(`https://swapi.py4e.com/api/people/?search=${filterText ?? ""}`, { signal })
      const data = await response.json()
      return {
        items: data.results ?? [],
        cursor: data.next ?? null,
      }
    },
  }),
}))
Alpine.magic("comboboxData", () => comboboxData)
Alpine.data("combobox", useControls(comboboxControls))
Alpine.plugin(usePlugin("combobox", combobox))
Alpine.start()
