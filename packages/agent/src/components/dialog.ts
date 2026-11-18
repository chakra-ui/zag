import type { Scope } from "@zag-js/core"
import * as dialog from "@zag-js/dialog"
import { buttonsIn, nameOf, textOf } from "../dom"
import { AGENT, type AgentDescriptor, byId, toBoolean } from "./shared"

const dialogContent = (scope: Scope) => byId(scope, `${scope.id}:content`)

export const dialogAgent: AgentDescriptor<dialog.Api> = {
  kind: "dialog",
  machine: dialog.machine,
  connect: dialog.connect,
  element: dialogContent,
  name: (scope) => textOf(byId(scope, `${scope.id}:title`)) || undefined,
  state: (api) => ({ open: api.open }),
  text: (scope) =>
    [textOf(byId(scope, `${scope.id}:title`)), textOf(byId(scope, `${scope.id}:description`))].filter(Boolean),
  container: dialogContent,
  actions: {
    async press({ args, scope, press }) {
      const wanted = String(args[0] ?? "")
      const buttons = buttonsIn(dialogContent(scope))
      const button = buttons.find((el) => (nameOf(el) ?? "").toLowerCase() === wanted.toLowerCase())
      if (!button) {
        throw new Error(`No button "${wanted}". Buttons: ${buttons.map((el) => nameOf(el)).join(", ")}.`)
      }
      await press(button)
    },
    setOpen: ({ api, args }) => {
      const value = toBoolean(args[0])
      api().setOpen(value, AGENT)
      return { key: "open", value }
    },
  },
}
