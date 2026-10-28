import * as checkbox from "@zag-js/checkbox"
import * as field from "@zag-js/field"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import checkboxStyles from "../../styles/machines/checkbox.module.css"
import styles from "../../styles/machines/field.module.css"
import { Button, Ghost, Log, Row, Stack, show } from "./shared"

function useField(props: Partial<field.Props> = {}) {
  const service = useMachine(field.machine, { id: useId(), ...props })
  return field.connect(service, normalizeProps)
}

function Label(props: { api: field.Api; children: React.ReactNode }) {
  const { api } = props
  return (
    <label className={styles.Label} {...api.getLabelProps()}>
      {props.children}
      <span
        className={styles.Required}
        {...api.getIndicatorProps({ type: "required" })}
      >
        *
      </span>
    </label>
  )
}

function Input(props: { api: field.Api } & React.ComponentProps<"input">) {
  const { api, ...rest } = props
  return (
    <input
      {...mergeProps(api.getInputProps(), { className: styles.Input }, rest)}
    />
  )
}

function ErrorText(props: { api: field.Api; children?: React.ReactNode }) {
  const { api } = props
  return (
    <span className={styles.ErrorText} {...api.getErrorTextProps()}>
      {props.children ?? api.errors[0]}
    </span>
  )
}

function Form(props: { children: React.ReactNode }) {
  const [count, setCount] = useState(0)
  return (
    <form
      style={{ width: "100%", display: "flex", justifyContent: "center" }}
      onSubmit={(event) => {
        event.preventDefault()
        setCount((n) => n + 1)
      }}
    >
      <Stack>
        {props.children}
        <Button type="submit">Submit</Button>
        <Log label="submitted" value={`${count} times`} />
      </Stack>
    </form>
  )
}

function EmailField(props: { api: field.Api; helper?: string }) {
  const { api } = props
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <Label api={api}>Email</Label>
      <Input
        api={api}
        type="email"
        name="email"
        placeholder="you@company.com"
      />
      {props.helper && (
        <span className={styles.HelperText} {...api.getHelperTextProps()}>
          {props.helper}
        </span>
      )}
      <ErrorText api={api} />
    </div>
  )
}

export function FieldRequired() {
  const api = useField({ required: true })
  return (
    <Form>
      <EmailField api={api} />
    </Form>
  )
}

export function FieldDisabled() {
  const api = useField({ disabled: true })
  return <EmailField api={api} helper="Editing is turned off" />
}

export function FieldReadOnly() {
  const api = useField({ readOnly: true })
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <Label api={api}>Account id</Label>
      <Input api={api} defaultValue="acct_29f81c" />
    </div>
  )
}

export function FieldValidationMode() {
  const api = useField({ required: true, validationMode: "onBlur" })
  return (
    <Stack>
      <EmailField api={api} helper="Type a few letters, then tab away" />
    </Stack>
  )
}

export function FieldCustomValidation() {
  const api = useField({
    validate({ value, validity }) {
      if (value === "taken@example.com") return "This email is already taken"
      if (validity.typeMismatch) return "Enter a valid email"
    },
  })
  return (
    <Form>
      <EmailField api={api} helper="Try taken@example.com" />
    </Form>
  )
}

const takenNames = ["admin", "root", "zag"]

function checkUsername(value: string) {
  return new Promise<boolean>((resolve) => {
    setTimeout(() => resolve(!takenNames.includes(value.toLowerCase())), 600)
  })
}

export function FieldAsyncValidation() {
  const api = useField({
    validationMode: "onChange",
    async validate({ value }) {
      const available = await checkUsername(value)
      return available ? null : "Username is taken"
    },
  })
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <Label api={api}>Username</Label>
      <Input api={api} placeholder="Try admin" />
      <span
        className={styles.Indicator}
        {...api.getIndicatorProps({ type: "validating" })}
      >
        Checking…
      </span>
      <ErrorText api={api} />
    </div>
  )
}

export function FieldErrorMatch() {
  const api = useField({ validationMode: "onBlur" })
  return (
    <Form>
      <div className={styles.Root} {...api.getRootProps()}>
        <Label api={api}>Website</Label>
        <Input api={api} type="url" required placeholder="https://" />
        <span
          className={styles.ErrorText}
          {...api.getErrorTextProps({ match: "valueMissing" })}
        >
          A URL is required
        </span>
        <span
          className={styles.ErrorText}
          {...api.getErrorTextProps({ match: "typeMismatch" })}
        >
          Enter a full URL, including https://
        </span>
      </div>
    </Form>
  )
}

export function FieldIndicators() {
  const api = useField({
    required: true,
    validationMode: "onChange",
    validate({ value }) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(value.length < 3 ? "Too short" : null), 400)
      })
    },
  })
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <Label api={api}>Display name</Label>
      <Input api={api} placeholder="At least 3 characters" />
      <Row>
        <span
          className={styles.Indicator}
          {...api.getIndicatorProps({ type: "validating" })}
        >
          Checking…
        </span>
        <span
          className={styles.Indicator}
          {...api.getIndicatorProps({ type: "valid" })}
        >
          Looks good
        </span>
        <span
          className={styles.Indicator}
          {...api.getIndicatorProps({ type: "invalid" })}
        >
          ! {api.errors[0]}
        </span>
      </Row>
    </div>
  )
}

export function FieldSelect() {
  const country = useField({ required: true })
  const bio = useField()
  return (
    <Form>
      <div className={styles.Root} {...country.getRootProps()}>
        <Label api={country}>Country</Label>
        <select
          className={styles.Select}
          {...country.getSelectProps()}
          name="country"
          required
        >
          <option value="">Select a country</option>
          <option value="ng">Nigeria</option>
          <option value="us">United States</option>
        </select>
        <ErrorText api={country} />
      </div>
      <div className={styles.Root} {...bio.getRootProps()}>
        <Label api={bio}>Bio</Label>
        <textarea
          className={styles.Textarea}
          {...bio.getTextareaProps()}
          name="bio"
          rows={3}
        />
      </div>
    </Form>
  )
}

export function FieldMultiControl() {
  const api = useField({ target: "amount", required: true })
  return (
    <Form>
      <div className={styles.Root} {...api.getRootProps()}>
        <Label api={api}>Amount</Label>
        <div className={styles.Group}>
          <select
            className={styles.Select}
            {...api.getSelectProps({ item: "currency" })}
            name="currency"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
          <input
            className={styles.Input}
            {...api.getInputProps({ item: "amount" })}
            name="amount"
            inputMode="decimal"
            placeholder="0.00"
          />
        </div>
        <ErrorText api={api} />
        <Log label="dirty" value={String(api.dirty)} />
      </div>
    </Form>
  )
}

export function FieldControlledState() {
  const [serverError, setServerError] = useState<string | null>(null)
  const api = useField({ invalid: !!serverError, touched: !!serverError })
  return (
    <Stack>
      <div className={styles.Root} {...api.getRootProps()}>
        <Label api={api}>Email</Label>
        <Input api={api} type="email" defaultValue="jane@company.com" />
        <ErrorText api={api}>{serverError ?? api.errors[0]}</ErrorText>
      </div>
      <Row>
        <Ghost onClick={() => setServerError("Email already registered")}>
          Simulate server error
        </Ghost>
        <Ghost onClick={() => setServerError(null)}>Clear</Ghost>
      </Row>
    </Stack>
  )
}

export function FieldWithCheckbox() {
  const fieldApi = useField({ required: true })
  const checkboxService = useMachine(checkbox.machine, {
    id: useId(),
    ids: { hiddenInput: fieldApi.ids.control },
    required: true,
    invalid: fieldApi.invalid,
  })
  const checkboxApi = checkbox.connect(checkboxService, normalizeProps)
  return (
    <div className={styles.Root} {...fieldApi.getRootProps()}>
      <label className={styles.Label} {...fieldApi.getLabelProps()}>
        Terms
      </label>
      <label className={checkboxStyles.Root} {...checkboxApi.getRootProps()}>
        <input
          {...mergeProps(checkboxApi.getHiddenInputProps(), {
            "aria-describedby": fieldApi.ariaDescribedby,
          })}
        />
        <div
          className={checkboxStyles.Control}
          {...checkboxApi.getControlProps()}
        >
          <span {...checkboxApi.getIndicatorProps()}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
            >
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>
        </div>
        <span>I accept the terms</span>
      </label>
      <span className={styles.HelperText} {...fieldApi.getHelperTextProps()}>
        Required to continue
      </span>
      <ErrorText api={fieldApi} />
    </div>
  )
}

export function FieldValidateFromCode() {
  const api = useField({ required: true })
  return (
    <Stack>
      <EmailField api={api} />
      <Row>
        <Ghost onClick={() => api.validate()}>validate()</Ghost>
        <Ghost onClick={() => api.clearErrors()}>clearErrors()</Ghost>
        <Ghost onClick={() => api.reset()}>reset()</Ghost>
      </Row>
      <Log
        label="state"
        value={`dirty ${api.dirty} · touched ${api.touched} · invalid ${api.invalid}`}
      />
    </Stack>
  )
}

export function FieldValidityChange() {
  const [errors, setErrors] = useState<string[]>([])
  const api = useField({
    required: true,
    validationMode: "onChange",
    onValidityChange: (details) => setErrors(details.errors),
  })
  return (
    <Stack>
      <EmailField api={api} />
      <Log label="errors" value={show(errors)} />
    </Stack>
  )
}
