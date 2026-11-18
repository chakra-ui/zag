import type { Scope } from "@zag-js/core"
import * as dialog from "@zag-js/dialog"
import { textOf } from "../dom"
import { AGENT, type AgentDescriptor, byId, pressIn, toBoolean } from "./shared"

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
    press: ({ args, scope, press }) => pressIn(dialogContent(scope), args[0], press),
    setOpen: ({ api, args }) => {
      const value = toBoolean(args[0])
      api().setOpen(value, AGENT)
      return { key: "open", value }
    },
  },
}
