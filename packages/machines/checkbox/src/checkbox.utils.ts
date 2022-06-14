import React from "react"

export const utils = {
  /**
   * Prevent `onBlur` being fired when the checkbox label is touched
   */
  stopEvent: (event: React.SyntheticEvent) => {
    event.preventDefault()
    event.stopPropagation()
  },
}
