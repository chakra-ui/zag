import * as fileUpload from "@zag-js/file-upload"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { HiX } from "react-icons/hi"
import styles from "../../styles/machines/file-upload.module.css"
import { Button, Log, Row, Stack, show } from "./shared"

function useFileUpload(props: Partial<fileUpload.Props> = {}) {
  const service = useMachine(fileUpload.machine, { id: useId(), ...props })
  return fileUpload.connect(service, normalizeProps)
}

function Upload(props: {
  api: fileUpload.Api
  hint?: string
  label?: string
  children?: React.ReactNode
}) {
  const { api } = props
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <label className={styles.Label} {...api.getLabelProps()}>
        {props.label ?? "Attachments"}
      </label>
      <div className={styles.Dropzone} {...api.getDropzoneProps()}>
        <input {...api.getHiddenInputProps()} />
        <span>Drag your files here</span>
        {props.hint && <span className={styles.Hint}>{props.hint}</span>}
        <button className={styles.Trigger} {...api.getTriggerProps()}>
          Choose files
        </button>
      </div>
      {props.children}
      <Files api={api} />
      <Rejected api={api} />
    </div>
  )
}

function Files(props: { api: fileUpload.Api }) {
  const { api } = props
  if (!api.acceptedFiles.length) return null
  return (
    <ul className={styles.ItemGroup} {...api.getItemGroupProps()}>
      {api.acceptedFiles.map((file, index) => (
        <li
          key={`${file.name}-${index}`}
          className={styles.Item}
          {...api.getItemProps({ file })}
        >
          <div {...api.getItemNameProps({ file })}>{file.name}</div>
          <span
            className={styles.ItemSize}
            {...api.getItemSizeTextProps({ file })}
          >
            {api.getFileSize(file)}
          </span>
          <button
            className={styles.ItemDelete}
            {...api.getItemDeleteTriggerProps({ file })}
          >
            <HiX />
          </button>
        </li>
      ))}
    </ul>
  )
}

function Rejected(props: { api: fileUpload.Api }) {
  const { api } = props
  if (!api.rejectedFiles.length) return null
  return (
    <ul
      className={styles.ItemGroup}
      {...api.getItemGroupProps({ type: "rejected" })}
    >
      {api.rejectedFiles.map(({ file, errors }, index) => (
        <li
          key={`${file.name}-${index}`}
          className={styles.Item}
          {...api.getItemProps({ file, type: "rejected" })}
        >
          <div {...api.getItemNameProps({ file, type: "rejected" })}>
            {file.name}
          </div>
          <span className={styles.ItemError}>{errors.join(", ")}</span>
        </li>
      ))}
    </ul>
  )
}

export function FileUploadAccept() {
  const api = useFileUpload({ accept: "image/*", maxFiles: 10 })
  return <Upload api={api} hint="Images only" />
}

export function FileUploadMaxFiles() {
  const api = useFileUpload({ maxFiles: 5 })
  return (
    <Stack>
      <Upload api={api} hint="Up to 5 files" />
      <Log label="remainingFiles" value={api.remainingFiles} />
    </Stack>
  )
}

export function FileUploadMinSize() {
  const api = useFileUpload({ minFileSize: 1024, maxFiles: 10 })
  return <Upload api={api} hint="At least 1 KB each" />
}

export function FileUploadMaxSize() {
  const api = useFileUpload({ maxFileSize: 1024 * 1024 * 10, maxFiles: 10 })
  return <Upload api={api} hint="Up to 10 MB each" />
}

export function FileUploadDefaultFiles() {
  const [files] = useState(() => [
    new File(["hello"], "hello.txt", { type: "text/plain" }),
  ])
  const api = useFileUpload({ defaultAcceptedFiles: files, maxFiles: 10 })
  return <Upload api={api} />
}

export function FileUploadControlled() {
  const [acceptedFiles, setAcceptedFiles] = useState<File[]>([])
  const api = useFileUpload({
    maxFiles: 10,
    acceptedFiles,
    onFileChange(details) {
      setAcceptedFiles(details.acceptedFiles)
    },
  })
  return (
    <Stack>
      <Upload api={api} />
      <Row>
        <Button
          onClick={() =>
            setAcceptedFiles([
              new File(["notes"], "notes.txt", { type: "text/plain" }),
            ])
          }
        >
          Set a file
        </Button>
        <Button onClick={() => setAcceptedFiles([])}>Clear from outside</Button>
      </Row>
      <Log label="acceptedFiles" value={acceptedFiles.length} />
    </Stack>
  )
}

export function FileUploadFileChange() {
  const [details, setDetails] = useState({ accepted: 0, rejected: 0 })
  const api = useFileUpload({
    accept: "image/*",
    maxFiles: 10,
    onFileChange(details) {
      setDetails({
        accepted: details.acceptedFiles.length,
        rejected: details.rejectedFiles.length,
      })
    },
  })
  return (
    <Stack>
      <Upload api={api} hint="Images only" />
      <Log
        label="onFileChange"
        value={`${details.accepted} accepted, ${details.rejected} rejected`}
      />
    </Stack>
  )
}

export function FileUploadAcceptReject() {
  const [accepted, setAccepted] = useState<string[]>([])
  const [rejected, setRejected] = useState<string[]>([])
  const api = useFileUpload({
    accept: "image/*",
    maxFiles: 10,
    onFileAccept(details) {
      setAccepted(details.files.map((file) => file.name))
    },
    onFileReject(details) {
      setRejected(details.files.map((item) => item.file.name))
    },
  })
  return (
    <Stack>
      <Upload api={api} hint="Images only" />
      <Log label="onFileAccept" value={show(accepted.join(", "))} />
      <Log label="onFileReject" value={show(rejected.join(", "))} />
    </Stack>
  )
}

export function FileUploadImagePreview() {
  const [image, setImage] = useState<string | null>(null)
  const api = useFileUpload({
    accept: "image/*",
    onFileChange(details) {
      const file = details.acceptedFiles[0]
      if (!file) return setImage(null)
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    },
  })
  return (
    <Upload api={api} hint="One image">
      {image && <img className={styles.Preview} src={image} alt="Preview" />}
    </Upload>
  )
}

export function FileUploadValidate() {
  const api = useFileUpload({
    maxFiles: 10,
    validate(file, details) {
      const errors: fileUpload.FileError[] = []
      if (file.size > 10 * 1024 * 1024) {
        errors.push("FILE_TOO_LARGE")
      }
      if (!file.name.endsWith(".pdf")) {
        errors.push("ONLY_PDF_ALLOWED")
      }
      const isDuplicate = details.acceptedFiles.some(
        (acceptedFile) => acceptedFile.name === file.name,
      )
      if (isDuplicate) {
        errors.push("FILE_EXISTS")
      }
      return errors.length > 0 ? errors : null
    },
  })
  return <Upload api={api} hint="PDFs only, no duplicates" />
}

export function FileUploadNoDrop() {
  const api = useFileUpload({ allowDrop: false, maxFiles: 10 })
  return <Upload api={api} hint="Dropping is off, use the button" />
}

export function FileUploadReadOnly() {
  const [files] = useState(() => [
    new File(["hello"], "hello.txt", { type: "text/plain" }),
  ])
  const api = useFileUpload({ readOnly: true, defaultAcceptedFiles: files })
  return <Upload api={api} />
}

export function FileUploadDirectory() {
  const api = useFileUpload({ directory: true, maxFiles: 100 })
  return <Upload api={api} label="Folder" hint="Pick a folder" />
}

export function FileUploadPaste() {
  const api = useFileUpload({ accept: "image/*", maxFiles: 10 })
  return (
    <Upload api={api} hint="Or paste an image below">
      <textarea
        className={styles.Paste}
        placeholder="Copy an image, then paste here"
        onPaste={(event) => {
          if (event.clipboardData?.files.length) {
            api.setFiles(Array.from(event.clipboardData.files))
          }
        }}
      />
    </Upload>
  )
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function FileUploadTransform() {
  const api = useFileUpload({
    maxFiles: 10,
    transformFiles: async (files) => {
      await wait(800)
      return files.map(
        (file) =>
          new File([file], file.name.toLowerCase().replace(/\s+/g, "-"), {
            type: file.type,
          }),
      )
    },
  })
  return (
    <Stack>
      <Upload api={api} hint="Names get lowercased and dashed" />
      <Log label="transforming" value={String(api.transforming)} />
    </Stack>
  )
}

export const fileUploadExamples = {
  FileUploadAccept,
  FileUploadMaxFiles,
  FileUploadMinSize,
  FileUploadMaxSize,
  FileUploadDefaultFiles,
  FileUploadControlled,
  FileUploadFileChange,
  FileUploadAcceptReject,
  FileUploadImagePreview,
  FileUploadValidate,
  FileUploadNoDrop,
  FileUploadReadOnly,
  FileUploadDirectory,
  FileUploadPaste,
  FileUploadTransform,
}
