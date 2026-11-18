import * as tagsInput from "@zag-js/tags-input"
import { type AgentDescriptor, elementOf, labelOf, toList } from "./shared"

const parts = tagsInput.anatomy.build()

export const tagsInputAgent: AgentDescriptor<tagsInput.Api> = {
  kind: "tags-input",
  machine: tagsInput.machine,
  connect: tagsInput.connect,
  element: (scope) => elementOf(scope, parts.root),
  name: (scope) => labelOf(scope, parts.label),
  state: (api) => ({ value: api.value }),
  actions: {
    // The input may refuse a tag, like a duplicate or one past its max, which is reported as rejected.
    setValue: ({ api, args }) => {
      const value = toList(args)
      api().setValue(value)
      return { key: "value", value }
    },
    add: ({ api, args }) => {
      const tag = String(args[0] ?? "")
      api().addValue(tag)
      return { key: "value", value: [...api().value, tag], holds: (committed) => (committed as string[]).includes(tag) }
    },
    remove: ({ api, args }) => {
      const tag = String(args[0] ?? "")
      if (!api().value.includes(tag)) throw new Error(`No tag "${tag}". Tags: ${api().value.join(", ")}.`)
      const value = api().value.filter((one) => one !== tag)
      api().setValue(value)
      return { key: "value", value }
    },
    clear: ({ api }) => {
      api().clearValue()
      return { key: "value", value: [] }
    },
  },
}
