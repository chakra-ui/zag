import * as fileUpload from "@zag-js/file-upload"
import { type AgentDescriptor, elementOf, labelOf } from "./shared"

const parts = fileUpload.anatomy.build()

// An agent has no files of its own to give, so it can only see and remove the ones a person chose.
export const fileUploadAgent: AgentDescriptor<fileUpload.Api> = {
  kind: "file-upload",
  machine: fileUpload.machine,
  connect: fileUpload.connect,
  element: (scope) => elementOf(scope, parts.root),
  name: (scope) => labelOf(scope, parts.label),
  state: (api) => ({ value: api.acceptedFiles.map((file) => file.name) }),
  items: (api) => api.acceptedFiles.map((file) => ({ value: file.name, label: file.name })),
  actions: {
    remove: ({ api, args, item }) => {
      const name = item(args[0]).value
      const file = api().acceptedFiles.find((one) => one.name === name)!
      api().deleteFile(file)
      const value = api()
        .acceptedFiles.map((one) => one.name)
        .filter((one) => one !== name)
      return { key: "value", value }
    },
    clear: ({ api }) => {
      api().clearFiles()
      return { key: "value", value: [] }
    },
  },
}
