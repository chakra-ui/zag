export const getFileDataUrl = async (file: File | Blob) => {
  const reader = new FileReader()
  return new Promise<string | undefined>((resolve, reject) => {
    reader.onerror = () => {
      reader.abort()
      reject(new Error("There was an error reading a file"))
    }

    reader.onloadend = () => {
      const { result } = reader
      if (result instanceof ArrayBuffer) {
        reject(new Error("Expected DataURL as string from Blob/File, got ArrayBuffer"))
      } else {
        resolve(result || undefined)
      }
    }

    reader.readAsDataURL(file)
  })
}
