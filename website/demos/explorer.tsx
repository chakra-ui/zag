import * as accordion from "@zag-js/accordion"
import * as checkbox from "@zag-js/checkbox"
import * as menu from "@zag-js/menu"
import * as select from "@zag-js/select"
import * as slider from "@zag-js/slider"
import * as tabs from "@zag-js/tabs"
import * as tagsInput from "@zag-js/tags-input"
import { Accordion } from "./accordion"
import { Checkbox } from "./checkbox"
import { Menu } from "./menu"
import { Select } from "./select"
import { Slider } from "./slider"
import { Tabs } from "./tabs"
import { TagsInput } from "./tags-input"

interface ExplorerDemo {
  component: React.ComponentType<any>
  props?: Record<string, unknown>
  anatomy: {
    keys: () => string[]
    build: () => Record<string, { attr: string }>
  }
}

export const explorerDemos: Record<string, ExplorerDemo> = {
  accordion: { component: Accordion, anatomy: accordion.anatomy },
  checkbox: { component: Checkbox, anatomy: checkbox.anatomy },
  menu: { component: Menu, anatomy: menu.anatomy, props: { open: true } },
  select: { component: Select, anatomy: select.anatomy, props: { open: true } },
  slider: { component: Slider, anatomy: slider.anatomy },
  tabs: { component: Tabs, anatomy: tabs.anatomy },
  "tags-input": { component: TagsInput, anatomy: tagsInput.anatomy },
}
