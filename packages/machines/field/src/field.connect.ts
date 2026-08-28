import type { Service } from "@zag-js/core"
import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { match } from "@zag-js/utils"
import { parts } from "./field.anatomy"
import * as dom from "./field.dom"
import type { ErrorTextProps, FieldApi, FieldSchema, FieldState, IndicatorProps, ItemProps } from "./field.types"
import { composeDescribedBy, isErrorMatch } from "./field.utils"

export function connect<T extends PropTypes>(service: Service<FieldSchema>, normalize: NormalizeProps<T>): FieldApi<T> {
  const { send, context, prop, computed, scope } = service

  const disabled = computed("disabled")
  const invalid = computed("invalid")
  const valid = computed("valid")
  const required = !!prop("required")
  const readOnly = !!prop("readOnly")

  const focused = !disabled && context.get("focused")
  const touched = context.get("touched")
  const dirty = context.get("dirty")
  const filled = context.get("filled")
  const validating = context.get("validating")

  const ids = {
    root: dom.getRootId(scope),
    control: dom.getControlId(scope, prop("target")),
    label: dom.getLabelId(scope),
    errorText: dom.getErrorTextId(scope),
    helperText: dom.getHelperTextId(scope),
  }

  const ariaDescribedby = composeDescribedBy({
    helperTextId: ids.helperText,
    hasHelperText: context.get("hasHelperText"),
    errorTextIds: context.get("errorTextIds"),
  })

  // -----------------------------------------------------------------------------
  // State getters: pure, serializable per-part state, independent of `normalize`
  // -----------------------------------------------------------------------------

  function getFieldState(): FieldState {
    return {
      disabled,
      invalid,
      valid,
      required,
      readOnly,
      touched,
      dirty,
      filled,
      focused,
      validating,
    }
  }

  function getErrorTextState(props: ErrorTextProps = {}) {
    const shown = isErrorMatch(props.match, {
      validity: context.get("validity"),
      invalid,
      disabled,
    })
    return { ...getFieldState(), hidden: !shown }
  }

  function getIndicatorState(props: IndicatorProps) {
    const fieldState = getFieldState()
    const shown = match(props.type, {
      required: () => fieldState.required,
      invalid: () => fieldState.invalid,
      valid: () => fieldState.valid === true,
      validating: () => fieldState.validating,
    })
    return { ...fieldState, type: props.type, hidden: !shown }
  }

  function getItemControlId(item: string) {
    return dom.getItemControlId(scope, item)
  }

  function resolveControlId(item?: string) {
    return item ? getItemControlId(item) : ids.control
  }

  function getControlBaseProps(props: ItemProps = {}) {
    const fieldState = getFieldState()
    const controlId = resolveControlId(props.item)
    const tracked = controlId === ids.control
    return {
      ...parts.control.attrs(scope.id),
      id: controlId,
      dir: prop("dir"),
      disabled: fieldState.disabled,
      required: fieldState.required,
      "aria-invalid": fieldState.invalid || undefined,
      "aria-describedby": ariaDescribedby,
      ...getDataAttrs(fieldState),
      ...(tracked
        ? {
            onFocus() {
              send({ type: "CONTROL.FOCUS" })
            },
            onBlur(event: { currentTarget: EventTarget | null }) {
              send({ type: "CONTROL.BLUR", value: getEventValue(event) })
            },
            onChange(event: { currentTarget: EventTarget | null }) {
              send({ type: "CONTROL.CHANGE", value: getEventValue(event) })
            },
            onInvalid(event: { preventDefault: VoidFunction; currentTarget: EventTarget | null }) {
              // suppress the native browser bubble; the field surfaces the error itself
              event.preventDefault()
              send({ type: "SUBMIT.INVALID", value: getEventValue(event) })
            },
          }
        : {}),
    }
  }

  const api: FieldApi<T> = {
    ids,
    disabled,
    invalid,
    valid,
    required,
    readOnly,
    focused,
    touched,
    dirty,
    filled,
    validating,
    errors: context.get("errors"),
    validity: context.get("validity"),
    ariaDescribedby,

    validate() {
      send({ type: "VALIDATE" })
    },

    clearErrors() {
      send({ type: "ERRORS.CLEAR" })
    },

    reset() {
      send({ type: "RESET" })
    },

    getItemControlId,

    getRootState: getFieldState,
    getRootProps() {
      return normalize.element({
        ...parts.root.attrs(scope.id),
        id: ids.root,
        dir: prop("dir"),
        role: "group",
        ...getDataAttrs(getFieldState()),
      })
    },

    getLabelState: getFieldState,
    getLabelProps(props: ItemProps = {}) {
      return normalize.label({
        ...parts.label.attrs(scope.id),
        id: ids.label,
        dir: prop("dir"),
        htmlFor: resolveControlId(props.item),
        ...getDataAttrs(getFieldState()),
      })
    },

    getControlState: getFieldState,
    getControlProps(props: ItemProps = {}) {
      return normalize.element({
        ...getControlBaseProps(props),
      })
    },

    getInputProps(props: ItemProps = {}) {
      return normalize.input({
        ...getControlBaseProps(props),
        readOnly: getFieldState().readOnly,
      })
    },

    getTextareaProps(props: ItemProps = {}) {
      return normalize.textarea({
        ...getControlBaseProps(props),
        readOnly: getFieldState().readOnly,
      })
    },

    getSelectProps(props: ItemProps = {}) {
      return normalize.select({
        ...getControlBaseProps(props),
      })
    },

    getHelperTextState: getFieldState,
    getHelperTextProps() {
      return normalize.element({
        ...parts.helperText.attrs(scope.id),
        id: ids.helperText,
        dir: prop("dir"),
        ...getDataAttrs(getFieldState()),
      })
    },

    getErrorTextState,
    getErrorTextProps(props: ErrorTextProps = {}) {
      const errorTextState = getErrorTextState(props)
      return normalize.element({
        ...parts.errorText.attrs(scope.id),
        id: dom.getErrorTextId(scope, props.match, props.id),
        dir: prop("dir"),
        hidden: errorTextState.hidden,
        "aria-live": "polite",
        ...getDataAttrs(errorTextState),
      })
    },

    getIndicatorState,
    getIndicatorProps(props) {
      const indicatorState = getIndicatorState(props)
      return normalize.element({
        ...parts.indicator.attrs(scope.id),
        dir: prop("dir"),
        "data-type": indicatorState.type,
        "aria-hidden": true,
        hidden: indicatorState.hidden,
        ...getDataAttrs(indicatorState),
      })
    },
  }

  return api
}

function getEventValue(event: { currentTarget: EventTarget | null }) {
  const target = event.currentTarget
  return target && "value" in target && typeof target.value === "string" ? target.value : ""
}

function getDataAttrs(state: FieldState) {
  return {
    "data-disabled": dataAttr(state.disabled),
    "data-invalid": dataAttr(state.invalid),
    "data-valid": dataAttr(state.valid === true),
    "data-required": dataAttr(state.required),
    "data-readonly": dataAttr(state.readOnly),
    "data-touched": dataAttr(state.touched),
    "data-dirty": dataAttr(state.dirty),
    "data-filled": dataAttr(state.filled),
    "data-focus": dataAttr(state.focused),
  }
}
