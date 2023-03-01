export function getAttributesAndHandlers(props: Record<string, any>) {
  const handlers = {}
  const attributes = {}

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
