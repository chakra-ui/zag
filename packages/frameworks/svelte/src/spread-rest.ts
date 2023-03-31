export function spreadRest(node: HTMLElement, unspreadables: Record<string, any>) {
  const { handlers, styles } = unspreadables
  Object.entries(handlers).forEach(([key, value]) => {
    node.addEventListener(key, value as EventListener)
  })

  return {
    update() {
      const splitStyles = styles.split(";")

      splitStyles.forEach((singleProperty: string) => {
        const [key, value] = singleProperty.split(":")

        node.style.setProperty(key, value)
      })
    },
    destroy() {
      Object.entries(handlers).forEach(([key, value]) => {
        node.removeEventListener(key, value as EventListener)
      })
    },
  }
}
