import type { Dict } from "@zag-js/core/src/types"

export function getAttributesAndHandlers(props: Dict) {
  const events: Dict = {}
  const attributes: Dict = {}
  let styles: Dict = {}

  Object.keys(props).forEach((key) => {
    // this is probably not a safe way to distiguish events
    if (key === "style") {
      styles = props[key]
    } else if (key.startsWith("on")) {
      events[key] = props[key]
    } else {
      attributes[key] = props[key]
    }
  })

  return { events, attributes, styles }
}
