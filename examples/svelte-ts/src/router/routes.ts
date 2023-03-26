import Select from "../pages/Select.svelte"
import Accordion from "../pages/Accordion.svelte"
import Main from "../pages/Main.svelte"
import Menu from "../pages/Menu.svelte"

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
  {
    path: "menu",
    label: "Menu",
    component: Menu,
  },
]
