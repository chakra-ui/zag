export function events(node: HTMLElement, props: Record<string, any>) {
  const { events: handlers } = props
  let events = { ...handlers }

  Object.entries(events).forEach(([key, value]) => {
    node.addEventListener(key, value as EventListener)
  })

  const updateEvents = (oldEvents: Record<string, EventListener>, newEvents: Record<string, EventListener>) => {
    if (oldEvents !== newEvents) {
      Object.entries(oldEvents).forEach(([key, value]) => {
        node.removeEventListener(key, value as EventListener)
      })
      Object.entries(newEvents).forEach(([key, value]) => {
        node.addEventListener(key, value as EventListener)
      })
      return { ...newEvents }
    }

    return { ...oldEvents }
  }

  return {
    update(props: Record<string, any>) {
      const { styles, events: handlers } = props

      // Attach styles
      const splitStyles = styles?.split(";")
      splitStyles.forEach((singleProperty: string) => {
        const [key, value] = singleProperty.split(":")

        node.style.setProperty(key.trimStart(), value)
      })

      events = updateEvents(events, handlers)
    },
    destroy() {
      Object.entries(events).forEach(([key, value]) => {
        node.removeEventListener(key, value as EventListener)
      })
    },
  }
}
