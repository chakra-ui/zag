export function setAttributes(node: Element, attributes: Record<string, any>) {
  Object.keys(attributes).forEach((attributeKey) => {
    const value = attributes[attributeKey]

    // hidden="false" and similar attributes will still count as truthy
    if (!value && node.hasAttribute(attributeKey)) {
      node.removeAttribute(attributeKey)
    }
    if (value) {
      node.setAttribute(attributeKey, value)
    }
  })
}
