const colors = {
  key: "dimgray",
  number: "lightskyblue",
  string: "lightcoral",
  true: "lightseagreen",
  false: "#f66578",
  null: "cornflowerblue",
}

const entities: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "`": "&#x60;",
  "=": "&#x3D;",
}

const HTML_RE = /[&<>"'`=]/g
// a string (and the colon that makes it a key), a literal, or a number
const TOKEN_RE = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+]?\d+)?)/g
const KEY_RE = /:$/

const escapeHtml = (value: string) => value.replace(HTML_RE, (char) => entities[char])

const span = (color: string, text: string, style = "") => `<span style="${style}color:${color}">${text}</span>`

function highlightToken(token: string) {
  if (token.startsWith('"')) {
    if (KEY_RE.test(token)) {
      // the key's text, without its quotes and the colon after it
      const end = token.lastIndexOf('"')
      return span(colors.key, `"${escapeHtml(token.slice(1, end))}${token.slice(end)}`)
    }
    const text = `"${escapeHtml(token.slice(1, -1))}"`
    return span(colors.string, text, "word-wrap:break-word;white-space:pre-wrap;")
  }
  if (token === "true") return span(colors.true, token)
  if (token === "false") return span(colors.false, token)
  if (token === "null") return span(colors.null, token)
  return span(colors.number, token)
}

/** Colors a JSON string as HTML: keys, strings, numbers, booleans and null each get a color */
export function highlightJson(json: string): string {
  return json.replace(TOKEN_RE, highlightToken)
}
