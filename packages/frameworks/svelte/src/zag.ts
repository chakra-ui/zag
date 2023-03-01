import { getAttributesAndHandlers } from "./get-attributes-and-handlers"
import { setAttributes } from "./set-attributes"

export function zag(node: Element, props: Record<string, any>) {
  const { handlers, attributes } = getAttributesAndHandlers(props)
  setAttributes(node, attributes)

  const events = Object.keys(handlers).map((handlerKey) => ({
    eventName: handlerKey.replace("on", "").toLowerCase(),
    handler: handlers[handlerKey],
  }))

  events.forEach((event) => {
    // add to document for performance later
    node.addEventListener(event.eventName, (e) => {
      // console.log("event fired", event.eventName);
      return event.handler(e)
    })
  })

  return {
    update(props: Record<string, any>) {
      const { attributes } = getAttributesAndHandlers(props)
      setAttributes(node, attributes)
    },
    destroy() {
      events.forEach((event) => {
        node.removeEventListener(event.eventName, event.handler)
      })
    },
  }
}
