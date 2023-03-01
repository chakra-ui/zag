import userEvent from "@testing-library/user-event"
import { getByLabelText as _getByLabelText, fireEvent } from "@testing-library/dom"
import { act } from "@testing-library/react"

export function getByPart(part: string) {
  const selector = `[data-part="${part}"]`
  const element = document.querySelector(selector)
  if (element == null) {
    throw new Error(`No element matching "${selector}"`)
  }
  return element
}

export const getByLabelText = (labelText: string) => _getByLabelText(document.body, labelText)

export const nextAnimationFrame = () => new Promise((resolve) => requestAnimationFrame(resolve))

export async function click(element: Element) {
  await act(async () => {
    await fireEvent.click(element)
    await nextAnimationFrame()
  })
}

export async function type(element: Element, text: string) {
  await userEvent.type(element, text)
  await nextAnimationFrame()
}

export async function pressEnter(element: Element) {
  await userEvent.type(element, "{enter}")
  await nextAnimationFrame()
}
