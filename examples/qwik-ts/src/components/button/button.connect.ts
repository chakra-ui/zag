import type { NormalizeProps } from "@zag-js/types"

export function connect(state: any, send: any, normalize: NormalizeProps<any>) {
  return {
    count: state.context.count,

    getButtonProps() {
      return normalize.element({
        "data-count": state.context.count,
        disabled: state.context.count >= 15,
        onClick: () => {
          send("INCREMENT")
        },
      })
    },
  }
}
