import { tagsInputConnect } from "./tags-input.connect"
import { tagsInputMachine } from "./tags-input.machine"

export const tagsInput = {
  machine: tagsInputMachine,
  connect: tagsInputConnect,
}

export type { TagsInputMachineContext, TagsInputMachineState } from "./tags-input.machine"
