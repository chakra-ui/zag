import Select from "../pages/Select.svelte"
import Accordion from "../pages/Accordion.svelte"
import Main from "../pages/Main.svelte"

export default [
  {
    path: "/",
    label: "Main",
    component: Main,
  },
  {
    path: "accordion",
    label: "Accordion",
    component: Accordion,
  },
  {
    path: "select",
    label: "Select",
    component: Select,
  },
]
