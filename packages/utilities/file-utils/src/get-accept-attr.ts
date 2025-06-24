function isMIMEType(v: string) {
  return v === "audio/*" || v === "video/*" || v === "image/*" || v === "text/*" || /\w+\/[-+.\w]+/g.test(v)
}

function isExt(v: string) {
  return /^.*\.[\w]+$/.test(v)
}

const isValidMIME = (v: string) => isMIMEType(v) || isExt(v)

export function getAcceptAttrString(accept: Record<string, string[]> | string | string[] | undefined) {
  if (accept == null) return

  if (typeof accept === "string") {
    return accept
  }

  if (Array.isArray(accept)) {
    return accept.filter(isValidMIME).join(",")
  }

  return Object.entries(accept)
    .reduce((a, [mimeType, ext]) => [...a, mimeType, ...ext], [] as string[])
    .filter(isValidMIME)
    .join(",")
}
