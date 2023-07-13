export function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const fileSize = (bytes / Math.pow(k, i)).toFixed(2)
  const formattedSize = new Intl.NumberFormat("en-US").format(Number(fileSize))
  return `${formattedSize} ${sizes[i]}`
}
