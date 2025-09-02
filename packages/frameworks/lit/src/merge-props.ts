import { createMergeProps } from "@zag-js/core"

// Create mergeProps function for Lit's event syntax (@event instead of onEvent)
export const mergeProps = createMergeProps({ eventPrefix: "@" })
