import * as fileUpload from "@zag-js/file-upload"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import { XIcon } from "lucide-react"
import { useId } from "react"
import { useForm } from "react-hook-form"

export default function Page() {
  const service = useMachine(fileUpload.machine, { id: useId() })

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<{ file: File[] }>()

  const api = fileUpload.connect(service, normalizeProps)

  return (
    <main>
      <form
        onSubmit={handleSubmit((data) => {
          console.log(data)
        })}
        style={{ width: "100%" }}
      >
        <div {...api.getRootProps()}>
          <input
            {...mergeProps(
              api.getHiddenInputProps(),
              register("file", {
                validate: (value) => Boolean(value.length) || "This is required",
              }),
            )}
          />
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

          {errors?.file?.message}
        </div>
      </form>
    </main>
  )
}
