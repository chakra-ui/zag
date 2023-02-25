import userEvent from "@testing-library/user-event"

export async function click(element: Element) {
  await userEvent.click(element)
  await new Promise((resolve) => requestAnimationFrame(resolve))
}

export async function clickOutside() {
  await click(document.body)
}

export const getByPart = (part: string) => {
  const selector = `[data-part="${part}"]`
  const element = document.querySelector(selector)
  if (element == null) {
    throw new Error(`No element matching "${selector}"`)
  }
  return element
}
