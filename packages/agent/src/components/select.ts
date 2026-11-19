import * as select from "@zag-js/select"
import { AGENT, type AgentDescriptor, byId, toBoolean } from "./shared"

export const selectAgent: AgentDescriptor<select.Api> = {
  kind: "select",
  machine: select.machine,
  connect: select.connect,
  element: (scope) => byId(scope, `${scope.id}:trigger`),
  state: (api) => ({ value: api.valueAsString }),
  items: (api) =>
    api.collection.items.map((item: unknown) => ({
      value: api.collection.getItemValue(item) ?? "",
      label: api.collection.stringifyItem(item) ?? "",
    })),
  actions: {
    setValue: ({ api, args, item }) => {
      const picked = args.flat().map((arg) => item(arg))
      // select's setValue takes no reason, so this change reports none.
      api().setValue(picked.map((one) => one.value))
      // The state shows the selected labels, as the select's trigger does.
      return { key: "value", value: picked.map((one) => one.label).join(", ") }
    },
    setOpen: ({ api, args }) => api().setOpen(toBoolean(args[0]), AGENT),
  },
}
