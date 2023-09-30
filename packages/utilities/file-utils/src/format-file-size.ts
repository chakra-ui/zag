const SIZES = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
const KILO = 1024

interface FormatByteOptions {
  locale?: string
}

export const formatFileSize = (bytes: number, options: FormatByteOptions = {}) => {
  const { locale = "en-US" } = options
  if (bytes === 0) return "0 B"

  const i = Math.floor(Math.log(bytes) / Math.log(KILO))
  const fileSize = bytes / Math.pow(KILO, i)

  const formattedSize = new Intl.NumberFormat(locale).format(fileSize)
  return `${formattedSize} ${SIZES[i]}`
}
