function isMIMEType(v: string) {
  return v === "audio/*" || v === "video/*" || v === "image/*" || v === "text/*" || /\w+\/[-+.\w]+/g.test(v)
}

function isExt(v: string) {
  return /^.*\.[\w]+$/.test(v)
}

export function getAcceptAttrString(accept: Record<string, string[]> | string | undefined) {
  if (!accept) return
  if (typeof accept === "string") return accept
  return Object.entries(accept)
    .reduce((a, [mimeType, ext]) => [...a, mimeType, ...ext], [] as string[])
    .filter((v) => isMIMEType(v) || isExt(v))
    .join(",")
}
