import { getRootNode } from "./node"

// a controlled element with one of these roles counts as part of its controller's component
const INTERACTIVE_CONTAINER_ROLE = new Set(["menu", "listbox", "dialog", "grid", "tree", "region", "application"])

const isInteractiveContainerRole = (role: string) => INTERACTIVE_CONTAINER_ROLE.has(role)

const getAriaControls = (element: HTMLElement) => element.getAttribute("aria-controls")?.split(" ") || []

/**
 * Checks if an element is within a controlled element that should be considered "inside"
 * the component via aria-controls relationships.
 */
export function isControlledElement(container: HTMLElement, element: HTMLElement): boolean {
  const visitedIds = new Set<string>()
  const rootNode = getRootNode(container)

  const checkElement = (searchRoot: HTMLElement): boolean => {
    const controllingElements = searchRoot.querySelectorAll<HTMLElement>("[aria-controls]")

    for (const controller of controllingElements) {
      if (controller.getAttribute("aria-expanded") !== "true") continue

      const controlledIds = getAriaControls(controller)

      for (const id of controlledIds) {
        if (!id || visitedIds.has(id)) continue
        visitedIds.add(id)

        const controlledElement = rootNode.getElementById(id)
        if (controlledElement) {
          // a modal manages its own interactions
          const role = controlledElement.getAttribute("role")
          const modal = controlledElement.getAttribute("aria-modal") === "true"

          if (role && isInteractiveContainerRole(role) && !modal) {
            if (controlledElement === element || controlledElement.contains(element)) {
              return true
            }
            if (checkElement(controlledElement)) {
              return true
            }
          }
        }
      }
    }

    return false
  }

  return checkElement(container)
}

/**
 * Finds controlled elements recursively starting from a search root.
 * Calls the provided callback for each valid controlled element found.
 */
export function findControlledElements(
  searchRoot: HTMLElement,
  callback: (controlledElement: HTMLElement) => void,
): void {
  const rootNode = getRootNode(searchRoot)
  const visitedIds = new Set<string>()

  const findRecursive = (root: HTMLElement) => {
    const controllingElements = root.querySelectorAll<HTMLElement>("[aria-controls]")

    for (const controller of controllingElements) {
      if (controller.getAttribute("aria-expanded") !== "true") continue

      const controlledIds = getAriaControls(controller)

      for (const id of controlledIds) {
        if (!id || visitedIds.has(id)) continue
        visitedIds.add(id)

        const controlledElement = rootNode.getElementById(id)
        if (controlledElement) {
          // a modal manages its own interactions and focus
          const role = controlledElement.getAttribute("role")
          const modal = controlledElement.getAttribute("aria-modal") === "true"

          if (role && INTERACTIVE_CONTAINER_ROLE.has(role) && !modal) {
            callback(controlledElement)
            findRecursive(controlledElement)
          }
        }
      }
    }
  }

  findRecursive(searchRoot)
}

/**
 * Gets all controlled elements that are outside the container but should be included
 * in the interaction boundary.
 */
export function getControlledElements(container: HTMLElement): HTMLElement[] {
  const controlledElements: Set<HTMLElement> = new Set()

  findControlledElements(container, (controlledElement) => {
    if (!container.contains(controlledElement)) {
      controlledElements.add(controlledElement)
    }
  })

  return Array.from(controlledElements)
}

/**
 * Checks if an element has an interactive container role.
 */
export function isInteractiveContainerElement(element: Element): boolean {
  const role = element.getAttribute("role")
  return Boolean(role && INTERACTIVE_CONTAINER_ROLE.has(role))
}

/**
 * Checks if an element is a controller (has aria-controls and is expanded).
 */
export function isControllerElement(element: Element): boolean {
  return element.hasAttribute("aria-controls") && element.getAttribute("aria-expanded") === "true"
}

/**
 * Checks if an element or its descendants have controllers.
 */
export function hasControllerElements(element: Element): boolean {
  if (isControllerElement(element)) return true
  return Boolean(element.querySelector?.('[aria-controls][aria-expanded="true"]'))
}

/**
 * Checks if an element is controlled by any expanded controller.
 */
export function isControlledByExpandedController(element: Element): boolean {
  if (!element.id) return false

  const rootNode = getRootNode(element)
  const escapedId = CSS.escape(element.id)
  const selector = `[aria-controls~="${escapedId}"][aria-expanded="true"], [aria-controls="${escapedId}"][aria-expanded="true"]`
  const controller = rootNode.querySelector(selector)
  return Boolean(controller && isInteractiveContainerElement(element))
}
