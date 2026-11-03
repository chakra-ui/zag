import { useForm, type AnyFieldApi } from "@tanstack/preact-form"
import * as fileUpload from "@zag-js/file-upload"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { XIcon } from "lucide-preact"
import { useId } from "preact/hooks"
import "@styles/file-upload.css"

function validateFiles({ value }: { value: File[] }) {
  return value.length ? undefined : "This is required"
}

function FileField({ fieldApi }: { fieldApi: AnyFieldApi }) {
  const service = useMachine(fileUpload.machine, {
    id: useId(),
    onFileChange: (details) => fieldApi.handleChange(details.acceptedFiles),
  })

  const api = fileUpload.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <input {...api.getHiddenInputProps()} />
      <div {...api.getDropzoneProps()}>
        <span>Drag your files here</span>
        <button {...api.getTriggerProps()}>Open Dialog</button>
      </div>

      <div>
        {api.acceptedFiles.map((file) => (
          <div {...api.getItemProps({ file })} key={file.name}>
            <div>
              {file.name} {api.getFileSize(file)}
            </div>
            <button {...api.getItemDeleteTriggerProps({ file })}>
              <XIcon />
            </button>
          </div>
        ))}
      </div>

      <button type="submit">Submit</button>

      {fieldApi.state.meta.errors[0]}
    </div>
  )
}

export default function Page() {
  const form = useForm({
    defaultValues: { file: [] as File[] },
    onSubmit: ({ value }) => {
      console.log(value)
    },
  })

  return (
    <main>
      <form
        style={{ width: "100%" }}
        onSubmit={(event) => {
          event.preventDefault()
          form.handleSubmit()
        }}
      >
        <form.Field name="file" validators={{ onSubmit: validateFiles }}>
          {(fieldApi) => <FileField fieldApi={fieldApi} />}
        </form.Field>
      </form>
    </main>
  )
}
