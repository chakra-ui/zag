import { Accordion } from "./accordion"
import { nanoid } from "nanoid"

const accordion = new Accordion(".accordion", {
  id: nanoid(),
  multiple: true,
})

accordion.init()
