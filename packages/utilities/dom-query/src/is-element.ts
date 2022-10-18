export function isDocument(value: any): value is Document {
  return value.nodeType === Node.DOCUMENT_NODE
}

export function isWindow(value: any): value is Window {
  return value?.toString() === "[object Window]"
}

export function isHTMLElement(value: any): value is HTMLElement {
  return typeof value === "object" && value?.nodeType === Node.ELEMENT_NODE && typeof value?.nodeName === "string"
}
