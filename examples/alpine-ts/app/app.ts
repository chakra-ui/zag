export function setupApp(element: HTMLButtonElement) {
  const button = document.createElement("button")

  button.textContent = "Click me to call /api/hello"
  element.appendChild(button)

  button.addEventListener("click", async () => {
    const res = await fetch("/api/hello")
    button.innerHTML = await res.text()
  })
}
