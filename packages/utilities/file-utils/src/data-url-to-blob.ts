export function dataURItoBlob(uri: string): Blob {
  const binary = atob(uri.split(",")[1])

  // separate out the mime component
  const mimeString = uri.split(",")[0].split(":")[1].split(";")[0]

  // write the bytes of the string to an ArrayBuffer
  const buffer = new ArrayBuffer(binary.length)

  // create a view into the buffer
  const intArray = new Uint8Array(buffer)

  for (let i = 0; i < binary.length; i++) {
    intArray[i] = binary.charCodeAt(i)
  }

  return new Blob([buffer], { type: mimeString })
}
