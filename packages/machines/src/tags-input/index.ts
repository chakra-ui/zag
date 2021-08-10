import { connectTagsInputMachine } from "./tags-input.connect"
import { tagsInputMachine } from "./tags-input.machine"

export const tagsInput = {
  machine: tagsInputMachine,
  connect: connectTagsInputMachine,
}

export type { TagsInputMachineContext, TagsInputMachineState } from "./tags-input.machine"
