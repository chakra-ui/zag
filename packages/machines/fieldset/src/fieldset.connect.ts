import type { Service } from "@zag-js/core"
import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./fieldset.anatomy"
import * as dom from "./fieldset.dom"
import type { FieldsetApi, FieldsetSchema, RootState } from "./fieldset.types"

export function connect<T extends PropTypes>(
  service: Service<FieldsetSchema>,
  normalize: NormalizeProps<T>,
): FieldsetApi<T> {
  const { context, prop, computed, scope } = service

  const disabled = computed("disabled")
  const invalid = !!prop("invalid")

  const ids = {
    root: dom.getRootId(scope),
    legend: dom.getLegendId(scope),
    errorText: dom.getErrorTextId(scope),
    helperText: dom.getHelperTextId(scope),
  }

  const ariaDescribedby =
    [
      context.get("hasHelperText") ? ids.helperText : undefined,
      context.get("hasErrorText") && invalid ? ids.errorText : undefined,
    ]
      .filter(Boolean)
      .join(" ") || undefined

  // -----------------------------------------------------------------------------
  // State getters: pure, serializable per-part state, independent of `normalize`
  // -----------------------------------------------------------------------------

  function getRootState(): RootState {
    return { disabled, invalid }
  }

  return {
    ids,
    disabled,
    invalid,

    getRootState,
    getRootProps() {
      const rootState = getRootState()
      return normalize.element({
        ...parts.root.attrs(scope.id),
        id: ids.root,
        dir: prop("dir"),
        disabled: prop("disabled"),
        "aria-labelledby": context.get("hasLegend") ? ids.legend : undefined,
        "aria-describedby": ariaDescribedby,
        ...getDataAttrs(rootState),
      })
    },

    getLegendProps() {
      return normalize.element({
        ...parts.legend.attrs(scope.id),
        id: ids.legend,
        dir: prop("dir"),
        ...getDataAttrs(getRootState()),
      })
    },

    getHelperTextProps() {
      return normalize.element({
        ...parts.helperText.attrs(scope.id),
        id: ids.helperText,
        dir: prop("dir"),
        ...getDataAttrs(getRootState()),
      })
    },

    getErrorTextProps() {
      const rootState = getRootState()
      return normalize.element({
        ...parts.errorText.attrs(scope.id),
        id: ids.errorText,
        dir: prop("dir"),
        hidden: !rootState.invalid,
        ...getDataAttrs(rootState),
      })
    },
  }
}

function getDataAttrs(state: RootState) {
  return {
    "data-disabled": dataAttr(state.disabled),
    "data-invalid": dataAttr(state.invalid),
  }
}
