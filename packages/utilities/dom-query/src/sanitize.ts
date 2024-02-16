export const sanitize = (str: string) =>
  str
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0)
      if (code > 0 && code < 128) return char
      if (code >= 128 && code <= 255) return `/x${code.toString(16)}`.replace("/", "\\")
      return ""
    })
    .join("")
    .trim()
