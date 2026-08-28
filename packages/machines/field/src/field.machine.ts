import { setup } from "@zag-js/core"
import { observeChildren, raf, trackFormControl } from "@zag-js/dom-query"
import { isEqual } from "@zag-js/utils"
import * as dom from "./field.dom"
import type { FieldParams, FieldSchema, ValidateResult, ValiditySnapshot } from "./field.types"
import { getValiditySnapshot, resolveValidation, shouldCommit, suppressValueMissing, toErrorArray } from "./field.utils"

const { createMachine } = setup<FieldSchema>()

export const machine = createMachine({
  props({ props }) {
    return {
      dir: "ltr",
      disabled: false,
      readOnly: false,
      required: false,
      validationMode: "onSubmit",
      ...props,
    }
  },

  initialState() {
    return "idle"
  },

  context({ prop, bindable }) {
    return {
      touched: bindable<boolean>(() => ({
        defaultValue: false,
        value: prop("touched"),
      })),
      dirty: bindable<boolean>(() => ({
        defaultValue: false,
        value: prop("dirty"),
      })),
      filled: bindable<boolean>(() => ({ defaultValue: false })),
      focused: bindable<boolean>(() => ({ defaultValue: false })),
      validating: bindable<boolean>(() => ({ defaultValue: false })),
      errors: bindable<string[]>(() => ({ defaultValue: [] })),
      validity: bindable<ValiditySnapshot | null>(() => ({ defaultValue: null })),
      errorTextIds: bindable<string[]>(() => ({ defaultValue: [] })),
      hasHelperText: bindable<boolean>(() => ({ defaultValue: false })),
      fieldsetDisabled: bindable<boolean>(() => ({ defaultValue: false })),
      submitAttempted: bindable<boolean>(() => ({ defaultValue: false })),
    }
  },

  refs() {
    return {
      markedDirty: false,
      initialValue: null,
      seq: 0,
    }
  },

  computed: {
    disabled: ({ prop, context }) => !!prop("disabled") || context.get("fieldsetDisabled"),
    valid: ({ prop, context }) => {
      if (prop("invalid")) return false
      if (prop("disabled") || context.get("fieldsetDisabled")) return null
      return context.get("validity")?.valid ?? null
    },
    invalid: ({ prop, context }) => {
      if (prop("invalid")) return true
      if (prop("disabled") || context.get("fieldsetDisabled")) return false
      return context.get("validity")?.valid === false
    },
  },

  watch({ track, prop, context, refs }) {
    track([() => prop("disabled")], () => {
      if (prop("disabled") && context.get("focused")) {
        context.set("focused", false)
      }
    })
    track([() => context.get("dirty")], () => {
      if (context.get("dirty")) refs.set("markedDirty", true)
    })
  },

  effects: ["trackControlState", "trackTextParts"],

  on: {
    "CONTROL.FOCUS": {
      actions: ["setFocused"],
    },
    "CONTROL.BLUR": [
      { guard: "shouldCommit", actions: ["setBlurred", "commitValidation"] },
      { actions: ["setBlurred"] },
    ],
    "CONTROL.CHANGE": [
      { guard: "shouldCommit", actions: ["trackValueState", "commitValidation"] },
      { actions: ["trackValueState", "silentValidate", "recoverValueMissing"] },
    ],
    // Native `invalid` event fired at submit time (bubble suppressed in connect)
    "SUBMIT.INVALID": {
      actions: ["markSubmitAttempted", "commitValidation"],
    },
    VALIDATE: {
      actions: ["forceDirty", "commitValidation"],
    },
    "VALIDATE.RESOLVE": {
      guard: "isCurrentValidation",
      actions: ["applyAsyncValidation"],
    },
    "ERRORS.CLEAR": {
      actions: ["clearValidation"],
    },
    RESET: {
      actions: ["resetField"],
    },
  },

  states: {
    idle: {},
  },

  implementations: {
    guards: {
      isCurrentValidation: ({ refs, event }) => event.seq === refs.get("seq"),
      shouldCommit: ({ prop, context, event }) =>
        shouldCommit({
          mode: prop("validationMode"),
          submitAttempted: context.get("submitAttempted"),
          eventType: event.type,
        }),
    },

    effects: {
      trackControlState({ context, refs, scope, send, prop }) {
        const controlEl = getTrackedControlEl({ scope, prop })
        if (!controlEl) return
        if (refs.get("initialValue") == null) {
          refs.set("initialValue", controlEl.value)
          context.set("filled", controlEl.value.length > 0)
        }
        return trackFormControl(controlEl, {
          onFieldsetDisabledChange(disabled) {
            context.set("fieldsetDisabled", disabled)
          },
          onFormReset() {
            send({ type: "RESET" })
          },
        })
      },

      trackTextParts({ context, scope }) {
        const sync = () => {
          const errorTextIds = dom.getVisibleErrorTextIds(scope)
          if (!isEqual(context.get("errorTextIds"), errorTextIds)) {
            context.set("errorTextIds", errorTextIds)
          }
          context.set("hasHelperText", !!scope.getById(dom.getHelperTextId(scope)))
        }
        sync()
        return observeChildren(() => dom.getRootEl(scope), {
          defer: true,
          callback: sync,
          attributes: true,
          attributeFilter: ["hidden"],
        })
      },
    },

    actions: {
      setFocused({ context }) {
        context.set("focused", true)
      },

      setBlurred({ context }) {
        context.set("focused", false)
        context.set("touched", true)
      },

      trackValueState({ context, refs, event }) {
        const value: string = event.value
        const dirty = value !== (refs.get("initialValue") ?? "")
        context.set("dirty", dirty)
        if (dirty) refs.set("markedDirty", true)
        context.set("filled", value.length > 0)
      },

      silentValidate(params) {
        silentValidate(params, params.event.value)
      },

      recoverValueMissing(params) {
        const { context, event } = params
        const validity = context.get("validity")
        if (!validity || validity.valid || !validity.valueMissing) return

        const controlEl = getTrackedControlEl(params)
        if (!controlEl) return

        const nextValidity = getValiditySnapshot(controlEl)
        if (!nextValidity.valid) return

        applyValidation(params, { customErrors: [], validity: nextValidity, value: event.value, nativeMessage: "" })
      },

      markSubmitAttempted({ context, refs }) {
        context.set("submitAttempted", true)
        refs.set("markedDirty", true)
      },

      forceDirty({ refs }) {
        refs.set("markedDirty", true)
      },

      commitValidation(params) {
        commitValidation(params, { value: params.event.value })
      },

      applyAsyncValidation(params) {
        const { event } = params
        applyValidation(params, {
          customErrors: toErrorArray(event.result),
          validity: event.validity,
          value: event.value,
          nativeMessage: event.nativeMessage,
        })
      },

      clearValidation(params) {
        clearValidation(params)
      },

      resetField(params) {
        const { context, refs } = params
        clearValidation(params)
        context.set("touched", false)
        context.set("dirty", false)
        context.set("focused", false)
        context.set("submitAttempted", false)
        refs.set("markedDirty", false)
        // form values are restored after the reset event's default action, so measure later
        raf(() => {
          const controlEl = getTrackedControlEl(params)
          if (!controlEl) return
          refs.set("initialValue", controlEl.value)
          context.set("filled", controlEl.value.length > 0)
        })
      },
    },
  },
})

interface CommitOptions {
  value?: string | undefined
}

function commitValidation(params: FieldParams, options: CommitOptions = {}) {
  const { prop, context, refs, scope, send } = params

  const controlEl = getTrackedControlEl(params)
  if (!controlEl) return

  // clear the previous custom error so the native snapshot is untainted
  controlEl.setCustomValidity("")

  let validity = getValiditySnapshot(controlEl)
  if (!refs.get("markedDirty") && !context.get("dirty")) {
    validity = suppressValueMissing(validity)
  }

  const value = options.value ?? controlEl.value
  const nativeMessage = validity.valid ? "" : controlEl.validationMessage

  const seq = refs.get("seq") + 1
  refs.set("seq", seq)

  const result = prop("validate")?.({ value, validity })

  if (isPromise(result)) {
    context.set("validating", true)
    result.then(
      (resolved) => send({ type: "VALIDATE.RESOLVE", seq, result: resolved, validity, value, nativeMessage }),
      (error) => {
        send({ type: "VALIDATE.RESOLVE", seq, result: null, validity, value, nativeMessage })
        queueMicrotask(() => {
          throw error
        })
      },
    )
    return
  }

  applyValidation(params, { customErrors: toErrorArray(result), validity, value, nativeMessage })
}

interface ApplyOptions {
  customErrors: string[]
  validity: ValiditySnapshot
  value: string
  nativeMessage: string
}

function applyValidation(params: FieldParams, options: ApplyOptions) {
  const { context, prop, scope } = params
  const { errors, validity } = resolveValidation(options)

  // mirror custom errors so native `:invalid` and submit gating agree
  if (options.customErrors.length > 0) {
    getTrackedControlEl(params)?.setCustomValidity(options.customErrors.join(" "))
  }

  const changed = context.get("validity")?.valid !== validity.valid || !isEqual(context.get("errors"), errors)

  context.set("validating", false)
  context.set("validity", validity)
  context.set("errors", errors)

  if (changed) {
    prop("onValidityChange")?.({ valid: validity.valid, errors, validity, value: options.value })
  }
}

/**
 * Runs custom validation and mirrors the result into `setCustomValidity` without
 * committing it to context. Keeps native `:invalid` and submit gating in sync
 * while the error stays hidden until the mode's commit point.
 */
function silentValidate(params: FieldParams, value: string) {
  const { prop, refs, scope } = params
  const validate = prop("validate")
  if (!validate) return

  const controlEl = getTrackedControlEl(params)
  if (!controlEl) return

  controlEl.setCustomValidity("")
  const validity = getValiditySnapshot(controlEl)

  const seq = refs.get("seq") + 1
  refs.set("seq", seq)

  const apply = (result: ValidateResult) => {
    if (refs.get("seq") !== seq) return
    controlEl.setCustomValidity(toErrorArray(result).join(" "))
  }

  const result = validate({ value, validity })
  if (isPromise(result)) {
    result.then(apply, () => apply(null))
  } else {
    apply(result)
  }
}

function clearValidation(params: FieldParams) {
  const { context, refs } = params
  // invalidate any in-flight async validation
  refs.set("seq", refs.get("seq") + 1)
  context.set("validating", false)
  context.set("errors", [])
  context.set("validity", null)
  getTrackedControlEl(params)?.setCustomValidity("")
}

function getTrackedControlEl(params: Pick<FieldParams, "scope" | "prop">) {
  return dom.getControlEl(params.scope, params.prop("target"))
}

function isPromise(value: unknown): value is Promise<ValidateResult> {
  return typeof value === "object" && value !== null && "then" in value
}
