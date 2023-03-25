import type { Dict } from "@zag-js/core/src/types"

export function getAttributesAndHandlers(props: Dict) {
  const handlers: Dict = {}
  const attributes: Dict = {}

  Object.keys(props).forEach((key) => {
    // this is probably not a safe way to distiguish handlers
    if (key.startsWith("on")) {
      handlers[key] = props[key]
    } else {
      attributes[key] = props[key]
    }
  })

  return { handlers, attributes }
}
